import React from 'react';

const NavBar = ({ isVisible }) => {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-lg transition-all duration-1000 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h2 className="text-2xl font-bold text-gray-900">PORTFOLIO</h2>
            <div className="hidden md:flex space-x-8">
              <a href="#work" className="text-gray-700 hover:text-green-700 transition-colors duration-300">
                Work
              </a>
              <a href="#about" className="text-gray-700 hover:text-green-700 transition-colors duration-300">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-green-700 transition-colors duration-300">
                Contact
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <button className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors duration-300">
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
