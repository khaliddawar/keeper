import React from 'react';
import Image from '../../../components/AppImage';

const AuthBackground = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-secondary rounded-full blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center px-12 py-16">
        <div className="max-w-md">
          {/* Hero Image */}
          <div className="mb-8">
            <Image
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&crop=center"
              alt="Person organizing thoughts and ideas on a digital workspace"
              className="w-full h-64 object-cover rounded-2xl shadow-elevated"
            />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-semibold text-foreground mb-4">
                Capture Every Thought
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                Transform fleeting ideas into organized, actionable insights with ThoughtKeeper's intuitive capture system.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <span className="text-text-secondary">Quick capture from anywhere</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                </div>
                <span className="text-text-secondary">Smart organization & tagging</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-success rounded-full" />
                </div>
                <span className="text-text-secondary">Convert thoughts to tasks</span>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
              <p className="text-sm text-text-secondary italic mb-3">
                "ThoughtKeeper has revolutionized how I capture and organize my ideas. It's like having a second brain that never forgets."
              </p>
              <div className="flex items-center space-x-3">
                <Image
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
                  alt="Sarah Chen, Product Designer"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Sarah Chen</p>
                  <p className="text-xs text-text-secondary">Product Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthBackground;