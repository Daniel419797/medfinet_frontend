import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MedFiNet HealthFinance API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/campaigns', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('campaigns')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/campaigns/:id/fund', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      currency = 'ALGO',
      method = 'simulated',
      tx_id,
      donor_id,
      donor_email,
      donor_name,
      message
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid donation amount'
      });
    }

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (campaignError || !campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    const donationStatus = 'completed';

    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert([{
        campaign_id: id,
        donor_id: donor_id || null,
        donor_email: donor_email || 'anonymous@medfi.net',
        donor_name: donor_name || 'Anonymous Donor',
        amount,
        currency,
        method,
        tx_id: tx_id || null,
        tx_verified: !!tx_id,
        status: donationStatus,
        message,
        donor_wallet: donor_email || 'anonymous'
      }])
      .select()
      .single();

    if (donationError) throw donationError;

    if (donationStatus === 'completed') {
      const newRaised = parseFloat(campaign.raised_amount || 0) + parseFloat(amount);
      const newDonorCount = (campaign.donor_count || 0) + 1;

      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          raised_amount: newRaised,
          donor_count: newDonorCount,
          current_amount: newRaised
        })
        .eq('id', id);

      if (updateError) throw updateError;
    }

    res.status(201).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('Error processing donation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/packages', async (req, res) => {
  try {
    const { category, active = 'true' } = req.query;

    let query = supabase
      .from('health_packages')
      .select('*')
      .order('price', { ascending: true });

    if (active !== undefined) {
      query = query.eq('active', active === 'true');
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/explorer/status', (req, res) => {
  res.json({
    success: true,
    configured: !!process.env.PURESTAKE_API_KEY,
    network: 'TestNet',
    message: 'Algorand integration running in simulated mode'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`
🚀 MedFiNet HealthFinance Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server: http://localhost:${PORT}
🏥 API health: http://localhost:${PORT}/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
