const path = require("path");
const fs = require("fs");
const slugify = require("slugify");
let posts = require("../db/db.json");

const index = (req, res) => {
  res.format({
    html: () => {
      let html = "<ul>";
      posts.forEach((post) => {
        html += `<li>
                    <div>
                        <a href="http://localhost:3000/posts/${post.slug}">
                            <h3>${post.title}</h3></a>
                            <img width="200" src=${`/${post.image}`} />
                            <p><strong>Ingredienti</strong>: ${post.tags
                              .map((t) => `<span class="tag">${t}</span>`)
                              .join(", ")}</p>
                    </div>
                </li>`;
      });
      html += "</ul>";
      res.send(html);
    },
    json: () => {
      res.json({
        data: posts,
        count: posts.length,
      });
    },
  });
};

const show = (req, res) => {
  const slugPostsRequest = req.params.slug;
  const postRequest = posts.find((post) => post.slug === slugPostsRequest);
  res.format({
    html: () => {
      if (postRequest) {
        const post = postRequest;
        res.send(`
                    <div>
                        <h3>${post.title}</h3>
                        <img width="200" src=${`/${post.image}`} />
                        <p><strong>Ingredienti</strong>: ${post.tags
                          .map((t) => `<span class="tag">${t}</span>`)
                          .join(", ")}</p>
                    </div>
                `);
      } else {
        res.status(404).send(`<h1>Post non trovato</h1>`);
      }
    },
    json: () => {
      if (postRequest) {
        res.json({
          ...postRequest,
          image_url: `http://${req.headers.host}/${postRequest.image}`,
        });
      } else {
        res.status(404).json({
          error: "Not Found",
          content: `Non esiste una pizza con slug ${slugPostsRequest}`,
        });
      }
    },
  });
};

const createSlug = (title) => {
  let baseSlug = slugify(title, { lower: true, strict: true });
  const slugs = posts.map((p) => p.slug);
  let counter = 1;
  let slug = baseSlug;
  while (slugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

const create = (req, res) => {
  const { title, content, tags } = req.body;
  const image = req.file.filename;

  if (!title || !content || !tags || !image) {
    return res.status(400).send("Dati mancanti.");
  }

  const slug = createSlug(title);

  const newPost = {
    title,
    slug,
    content,
    image,
    tags: tags.split(",").map((tag) => tag.trim()),
  };

  posts.push(newPost);
  fs.writeFileSync(
    path.join(__dirname, "../db/db.json"),
    JSON.stringify(posts, null, 2)
  );

  res.format({
    html: () => res.redirect(`/posts/${slug}`),
    json: () => res.status(201).json({ ...newPost, slug }),
  });
};

const destroy = (req, res) => {
  const slug = req.params.slug;
  const postIndex = posts.findIndex((p) => p.slug === slug);

  if (postIndex !== -1) {
    const deletedPost = posts.splice(postIndex, 1)[0];
    fs.writeFileSync(
      path.join(__dirname, "../db/db.json"),
      JSON.stringify(posts, null, 2)
    );

    const imageName = deletedPost.image;
    deletePublicImage(imageName);

    res.format({
      html: () => res.redirect("/posts"),
      json: () => res.send("Post eliminato"),
    });
  } else {
    res.status(404).format({
      html: () => res.send("<h1>Post non trovato</h1>"),
      json: () => res.json({ error: "Post non trovato" }),
    });
  }
};

const updatePosts = (newPosts) => {
  const filePath = path.join(__dirname, "../db/db.json");
  fs.writeFileSync(filePath, JSON.stringify(newPosts, null, 2));
  posts = newPosts;
};

const deletePublicImage = (imageName) => {
  const imagePath = path.join(__dirname, "../public", imageName);
  fs.unlinkSync(imagePath);
};

const download = (req, res) => {
  const post = posts.find((p) => p.slug === req.params.slug);
  if (post) {
    const filePath = path.join(__dirname, "..", "public", post.image);
    res.download(filePath);
  } else {
    res.status(404).json({ error: "Post not found" });
  }
};

module.exports = { index, show, create, destroy, download };
