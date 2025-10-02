
import React from 'react';
import Adsense from './Adsense';

const Sidebar: React.FC = () => {
    return (
        <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20">
                <h3 className="text-lg font-bold mb-4 text-text-secondary">Advertisement</h3>
                <Adsense
                    adSlot="9876543210"
                    adFormat="auto"
                    responsive={true}
                />
                {/* You can add more sidebar content here in the future, like top creators or trending tags */}
            </div>
        </aside>
    );
};

export default Sidebar;