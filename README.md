# LabelSync - Decentralized Data Labeling Platform

**LabelSync** is a decentralized platform that streamlines the process of labeling datasets for **machine learning models**, **youtubers** and **AI** applications. By enabling collaboration across multiple users, LabelSync allows for efficient, large-scale data annotation with secure storage.

## Key Features
- **Collaborative Data Labeling**: Facilitates teamwork in labeling large datasets, significantly speeding up the data preparation process for machine learning models.
- **AWS S3 Integration**: Secure and scalable storage for datasets, with **presigned URLs** used for file access and uploads.
- **User-friendly Interface**: Built with **Next.js**, LabelSync provides an intuitive and responsive frontend for a seamless user experience.
- **Flexible Use Cases**: Supports labeling tasks for various domains such as **image classification**, and more.

## Use Cases
- **Machine Learning Model Training**: High-quality labeled data for training supervised learning models in various domains.
- **AI-Powered Applications**: Provides accurately labeled datasets for industries like healthcare, finance, and autonomous vehicles.
- **Crowdsourcing Data Annotation**: Enables crowdsourced data labeling tasks for large-scale projects.

## Technology Stack
- **Frontend**: Built with **Next.js** for server-side rendering, routing, and fast user interactions.
- **Backend**: Node.js, Express.js for API and server-side logic.
- **Database**: Prisma and PostgreSQL for managing user data and labeling tasks.
- **File Storage**: AWS S3 for secure and scalable storage of labeled data.
- **Authentication**: JSON Web Tokens (JWT) for secure user authentication and authorization.

## Getting Started
### Prerequisites
- [Node.js](https://nodejs.org/)
- AWS Account (for S3 bucket setup)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/LabelSync.git
2. Install dependencies:
   ```bash
   cd LabelSync
   npm install
3. Set up your environment variables:
   ```bash
   DATABASE_URL: Your PostgreSQL connection string.
   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY: AWS S3 credentials.
   JWT_SECRET: Secret key for JWT authentication.
4. Start the server:
   ```bash
   npm run dev

   
- Access the app at `http://localhost:3000` to begin your data labeling tasks.
    
      
