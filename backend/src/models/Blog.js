import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    metaDescription: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: 'AAAN Cart' },
    image: { type: String }, // Optional banner image url
    tags: [{ type: String }],
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models?.Blog || mongoose.model('Blog', blogSchema);
