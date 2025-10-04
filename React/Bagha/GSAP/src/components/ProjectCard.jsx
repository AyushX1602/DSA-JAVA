import React from 'react';
import { gsap } from 'gsap';

const ProjectCard = ({ title, description, image, delay = 0 }) => {
    const handleMouseEnter = (e) => {
        gsap.to(e.currentTarget, {
            scale: 1.05,
            duration: 0.4,
            ease: 'power2.out'
        });

        gsap.to(e.currentTarget.querySelector('img'), {
            scale: 1.1,
            duration: 0.6,
            ease: 'power2.out'
        });
    };

    const handleMouseLeave = (e) => {
        gsap.to(e.currentTarget, {
            scale: 1,
            duration: 0.4,
            ease: 'power2.out'
        });

        gsap.to(e.currentTarget.querySelector('img'), {
            scale: 1,
            duration: 0.6,
            ease: 'power2.out'
        });
    };

    return (
        <div
            className="cursor-pointer"
            style={{ animationDelay: `${delay}ms` }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-500 ease-in-out overflow-hidden">
                <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 hover:text-gray-700 transition-colors duration-300">
                        {title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
