# Deploying to Netlify

This document provides instructions for deploying both the server and client components of the Claude 3.7 Chatbot to Netlify.

## Server Deployment

The server has been configured to run as Netlify Functions.

### Steps to Deploy the Server:

1. **Create a new Netlify site**:
   - Sign up for a Netlify account if you don't have one: https://app.netlify.com/signup
   - Click "New site from Git"
   - Connect to your Git provider and select your repository
   - Set the base directory to `server`
   - Set the build command to `npm install`
   - Set the publish directory to `public`
   - Click "Deploy site"

2. **Set up environment variables**:
   - Go to Site settings > Build & deploy > Environment
   - Add the following environment variables:
     - `ANTHROPIC_API_KEY`: Your Anthropic API key
     - `CORS_ORIGIN`: The URL of your client application (e.g., https://your-client-app.netlify.app)
     - `NODE_ENV`: Set to `production`

3. **Verify the deployment**:
   - Once deployed, your server functions will be available at:
     - `https://your-netlify-site-name.netlify.app/.netlify/functions/chat`
     - `https://your-netlify-site-name.netlify.app/.netlify/functions/health`

## Client Deployment

The client has been configured to work with the Netlify-deployed server.

### Steps to Deploy the Client:

1. **Update the API URL**:
   - Edit the `.env.production` file in the `client-ts` directory
   - Set `REACT_APP_API_URL` to your Netlify server URL (e.g., https://your-server-app.netlify.app)

2. **Create a new Netlify site**:
   - Sign up for a Netlify account if you don't have one: https://app.netlify.com/signup
   - Click "New site from Git"
   - Connect to your Git provider and select your repository
   - Set the base directory to `client-ts`
   - Set the build command to `npm run build`
   - Set the publish directory to `build`
   - Click "Deploy site"

3. **Verify the deployment**:
   - Once deployed, your client application will be available at:
     - `https://your-client-app.netlify.app`

## Troubleshooting

- **CORS Issues**: Make sure the `CORS_ORIGIN` environment variable in the server deployment matches the URL of your client application.
- **API Connection Issues**: Verify that the `REACT_APP_API_URL` in the client's `.env.production` file is set correctly.
- **Function Errors**: Check the Netlify function logs in the Netlify dashboard for any errors.

## Additional Resources

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects/) 