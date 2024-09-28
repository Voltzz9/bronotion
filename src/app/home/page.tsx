import React from 'react';
import Header from '@/components/ui/header';

const HomePage: React.FC = () => {

    return (
        <div className="home-container">
            <Header />
            <main className="home-main">
                <h1>Welcome to the Home Page</h1>
                <section className="features">
                    <h2>Features</h2>
                    <ul>
                        <li>Feature 1: Description of feature 1.</li>
                        <li>Feature 2: Description of feature 2.</li>
                        <li>Feature 3: Description of feature 3.</li>
                    </ul>
                </section>
            </main>
        </div>
    );
};

export default HomePage;