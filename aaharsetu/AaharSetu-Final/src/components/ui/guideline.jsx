function GuidelineItem({ icon, title, description }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">{icon}</div>
            <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    );
}

export default GuidelineItem