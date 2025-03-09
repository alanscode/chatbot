#!/bin/bash

# Build the client
echo "Building client..."
cd client-ts
npm run build

# Copy the build to the server's public directory
echo "Copying build to server..."
rm -rf ../server/public
mkdir -p ../server/public
cp -r build/* ../server/public/

# Deploy to Netlify
echo "Deploying to Netlify..."
cd ../server
netlify deploy --prod

echo "Deployment complete!" 