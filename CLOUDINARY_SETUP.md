# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image uploads in your portfolio application.

## 1. Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Click "Sign Up for Free"
3. Create your account using email or social login
4. Verify your email if required

## 2. Get Your Cloudinary Credentials

1. After logging in, go to your Dashboard
2. You'll see your account details at the top:
   - **Cloud Name**: This is your unique identifier
   - **API Key**: Your public API key
   - **API Secret**: Your private API secret (keep this secure)

## 3. Configure Environment Variables

Update your backend `.env` file with your Cloudinary credentials:

```bash
# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

Replace the placeholders with your actual values from the Cloudinary dashboard.

## 4. Cloudinary Features Used

### Upload Options

- **Folder Organization**: Images are organized in folders (e.g., `portfolio/projects`, `portfolio/media`)
- **Automatic Optimization**: Cloudinary automatically optimizes images for web
- **Format Conversion**: Supports automatic format selection (WebP, AVIF when supported)
- **Quality Optimization**: Automatic quality adjustment for optimal file size

### Security Features

- **Signed Uploads**: Uses signature-based authentication for secure uploads
- **Access Control**: Only authenticated users can upload files
- **File Validation**: Server-side validation of file types and sizes

## 5. Folder Structure

Your uploads will be organized as follows:

```
your-cloud-name/
├── portfolio/
│   ├── projects/          # Project screenshots
│   ├── media/            # General media files
│   ├── team/             # Team member photos
│   └── services/         # Service-related images
```

## 6. Upload Methods

The application provides two upload methods:

### Direct Upload (Recommended)

- Files are uploaded directly through your backend
- Simpler implementation
- Good for most use cases

### Signed Upload (More Secure)

- Files are uploaded with cryptographic signatures
- More secure for sensitive applications
- Requires additional signature generation step

## 7. Image Transformations

Cloudinary provides powerful image transformations. You can modify URLs to apply transformations:

```javascript
// Original image
https://res.cloudinary.com/your-cloud/image/upload/v1234567890/portfolio/projects/image.jpg

// Resized to 300x200
https://res.cloudinary.com/your-cloud/image/upload/c_fill,w_300,h_200/v1234567890/portfolio/projects/image.jpg

// Auto-optimized quality and format
https://res.cloudinary.com/your-cloud/image/upload/q_auto,f_auto/v1234567890/portfolio/projects/image.jpg
```

## 8. Testing Your Setup

1. Start your backend server: `npm run start:dev`
2. Start your frontend: `npm run dev`
3. Log into the admin panel
4. Try uploading an image in the Media section
5. Check your Cloudinary dashboard to see the uploaded files

## 9. Monitoring and Usage

- **Dashboard**: Monitor your usage in the Cloudinary dashboard
- **Free Tier**: Includes generous limits for development
- **Analytics**: View upload statistics and transformation usage
- **Storage**: Track storage usage and manage files

## 10. Production Considerations

### Environment Variables

Ensure your production environment has the correct Cloudinary credentials:

```bash
CLOUDINARY_CLOUD_NAME=your-production-cloud-name
CLOUDINARY_API_KEY=your-production-api-key
CLOUDINARY_API_SECRET=your-production-api-secret
```

### Security Best Practices

- Never expose your API secret in client-side code
- Use signed uploads for sensitive applications
- Implement proper file validation on the backend
- Consider setting up upload presets in Cloudinary dashboard

### Performance

- Enable auto-optimization: `q_auto,f_auto`
- Use appropriate image sizes for different contexts
- Consider implementing lazy loading for better page performance

## 11. Troubleshooting

### Common Issues

**Upload Fails with Authentication Error**

- Check that your API credentials are correct
- Ensure environment variables are loaded properly
- Verify that the API secret is kept private

**Images Not Displaying**

- Check that the URLs are correctly formed
- Ensure your cloud name is correct in the URLs
- Verify that images were successfully uploaded to Cloudinary

**Slow Upload Performance**

- Check your internet connection
- Consider using smaller file sizes
- Verify Cloudinary server region (automatic selection usually works best)

### Getting Help

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Documentation](https://cloudinary.com/documentation/node_integration)
- [Community Support](https://community.cloudinary.com/)

## 12. Migration from AWS S3

If you're migrating from AWS S3:

1. Update environment variables from AWS to Cloudinary
2. The upload API endpoints have been updated to work with Cloudinary
3. Existing S3 URLs will need to be migrated to Cloudinary URLs
4. Consider bulk upload tools if you have many existing images

Your portfolio application is now configured to use Cloudinary for image uploads and management!
