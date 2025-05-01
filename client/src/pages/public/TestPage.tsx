import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const TestPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">Blog Interface Test Page</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link href="/blogs">
          <Button className="w-full" variant="default">Go to Blogs List</Button>
        </Link>
        
        <Link href="/blogs/1">
          <Button className="w-full" variant="outline">View Blog Detail (ID: 1)</Button>
        </Link>
      </div>
    </div>
  );
};

export default TestPage;