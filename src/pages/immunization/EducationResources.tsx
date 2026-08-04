import { useState } from 'react';
import { Book, Search, Award, Video, FileText, ExternalLink } from 'lucide-react';

// Mock educational resources
const educationalResources = [
  {
    id: '1',
    title: 'Understanding Childhood Vaccines',
    description: 'A comprehensive guide to childhood vaccines and their importance.',
    type: 'article',
    image: 'https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=300',
    url: '#',
    category: 'basics',
  },
  {
    id: '2',
    title: 'Vaccine Safety and Efficacy',
    description: 'Learn about how vaccines are tested and monitored for safety.',
    type: 'video',
    image: 'https://images.pexels.com/photos/4167541/pexels-photo-4167541.jpeg?auto=compress&cs=tinysrgb&w=300',
    url: '#',
    category: 'safety',
  },
  {
    id: '3',
    title: 'The Science Behind mRNA Vaccines',
    description: 'An in-depth look at how mRNA vaccine technology works.',
    type: 'article',
    image: 'https://images.pexels.com/photos/5863392/pexels-photo-5863392.jpeg?auto=compress&cs=tinysrgb&w=300',
    url: '#',
    category: 'science',
  },
  {
    id: '4',
    title: 'Recommended Vaccine Schedule',
    description: 'CDC\'s recommended immunization schedule for children and adolescents.',
    type: 'guide',
    image: 'https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=300',
    url: '#',
    category: 'basics',
  },
  {
    id: '5',
    title: 'Common Questions About Vaccines',
    description: 'Answers to frequently asked questions about childhood vaccines.',
    type: 'article',
    image: 'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=300',
    url: '#',
    category: 'basics',
  },
  {
    id: '6',
    title: 'Blockchain in Healthcare Explained',
    description: 'How blockchain technology is transforming healthcare data management.',
    type: 'video',
    image: 'https://images.pexels.com/photos/8370754/pexels-photo-8370754.jpeg?auto=compress&cs=tinysrgb&w=300',
    url: '#',
    category: 'technology',
  },
];

const EducationResources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const filteredResources = educationalResources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      activeCategory === 'all' || 
      resource.category === activeCategory;
      
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Education Resources</h1>
        <p className="text-neutral-600">Learn about immunizations, blockchain technology, and healthcare</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="sm:w-48">
              <select
                className="input"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="basics">Vaccine Basics</option>
                <option value="safety">Vaccine Safety</option>
                <option value="science">Science & Research</option>
                <option value="technology">Blockchain Technology</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured resource */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center">
          <div className="md:flex-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-primary-800 mb-4">
              <Award className="h-3 w-3 mr-1" /> Featured Resource
            </span>
            <h2 className="text-2xl font-bold text-white mb-2">
              The Importance of Childhood Immunization
            </h2>
            <p className="text-primary-100 mb-6">
              Learn why immunizations are crucial for protecting your child and community from preventable diseases.
            </p>
            <a
              href="#"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-700 bg-white hover:bg-primary-50"
            >
              Read Full Article
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
          <div className="mt-6 md:mt-0 md:ml-6 md:flex-shrink-0">
            <img
              src="https://images.pexels.com/photos/7089626/pexels-photo-7089626.jpeg?auto=compress&cs=tinysrgb&w=300"
              alt="Child being vaccinated"
              className="h-48 w-full md:w-48 object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
      
      {/* Resource cards */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="card hover:translate-y-[-5px]">
              <div className="h-40 overflow-hidden">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${resource.type === 'article' ? 'bg-primary-100 text-primary-800' : 
                      resource.type === 'video' ? 'bg-accent-100 text-accent-800' : 
                      'bg-secondary-100 text-secondary-800'}`}
                  >
                    {resource.type === 'article' ? (
                      <FileText className="h-3 w-3 mr-1" />
                    ) : resource.type === 'video' ? (
                      <Video className="h-3 w-3 mr-1" />
                    ) : (
                      <Book className="h-3 w-3 mr-1" />
                    )}
                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{resource.title}</h3>
                <p className="text-neutral-600 text-sm mb-4">{resource.description}</p>
                <a
                  href={resource.url}
                  className="text-primary-600 font-medium text-sm flex items-center hover:text-primary-800"
                >
                  {resource.type === 'article' || resource.type === 'guide' ? 'Read More' : 'Watch Video'}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Book className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No resources found</h3>
          <p className="text-neutral-600 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('all');
            }}
            className="btn-primary"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default EducationResources;