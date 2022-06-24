require('dotenv').config();
const isMongo = process.env.ORM === 'MONGOOSE';

const Normalizer = {
  article(entry) {
    if (!entry) return;
    const article = {
      id: isMongo ? entry._id.toString() : entry.id.toString(),
      slug: entry.slug,
      title: entry.title,
      description: entry.description,
      body: entry.body,
      tagList: entry.tagList,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      favorited: entry.favorited,
      favoritesCount: entry.favoritesCount,
    };
    if (entry.author) {
      article.author = {
        id: isMongo ? entry.author._id.toString() : entry.author.id.toString(),
        username: entry.author.username,
        bio: entry.author.bio,
        image: entry.author.image,
        following: entry.author.following,
      };
    }
    return article;
  },

  user(entry) {
    if (!entry) return;
    const user = {
      id: isMongo ? entry._id?.toString() : entry.id?.toString(),
      bio: entry.bio,
      email: entry.email,
      image: entry.image,
      username: entry.username,
    };
    if (entry.following) {
      user.following = entry.following
          .map((userId) => isMongo ? userId._id.toString() : userId.toString());
    }
    if (entry.favorites) {
      user.favorites = entry.favorites
          .map((articleId) => isMongo ? articleId._id.toString() : articleId.toString());
    }
    if (entry.password) {
      user.password = entry.password;
    }
    return user;
  },

  profile(entry) {
    if (!entry) return;
    return {
      id: isMongo ? entry._id.toString() : entry.id.toString(),
      bio: entry.bio,
      image: entry.image,
      username: entry.username,
      following: entry.following,
    };
  },

  comment(entry) {
    if (!entry) return;
    return {
      id: isMongo ? entry._id.toString() : entry.id.toString(),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      body: entry.body,
      article: isMongo ? entry.article._id.toString() : entry.articleId.toString(),
      author: {
        id: isMongo ? entry.author._id.toString() : entry.author.id.toString(),
        username: entry.author.username,
        bio: entry.author.bio,
        image: entry.author.image,
      },
    };
  },
};


module.exports = Normalizer;
