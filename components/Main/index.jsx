"use client";
import React from "react";

const MainApp = ({ children }) => {
  return (
    <main id="main-app" className="container mx-auto  pt-16 px-6 flex-grow">
      {children}
    </main>
  );
};

export default MainApp;
