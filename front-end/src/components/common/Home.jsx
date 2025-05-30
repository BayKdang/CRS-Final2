import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import FeaturedCars from './FeaturedCars';
import About from './About';
import FAQ from './FAQ';
import Footer from './Footer';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturedCars />
      <About />
      <FAQ />
      <Footer />
      <LoginModal />
      <RegisterModal />
    </>
  );
};

export default Home;