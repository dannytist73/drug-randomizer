/**
 * Controller for handling resources and blog content
 */
const resourcesController = {
  /**
   * Render the resources page
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getResourcesPage: (req, res) => {
    // Sample resources data
    const resources = [
      {
        title: "Understanding Drug Addiction",
        content:
          "Drug addiction is a chronic disease characterized by drug seeking and use that is compulsive, or difficult to control, despite harmful consequences.",
        imageUrl:
          "https://plus.unsplash.com/premium_photo-1674491520278-f13635c36f93?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        slug: "science-of-addiction",
      },
      {
        title: "Effects on Health",
        content:
          "Drug use can have short and long-term health effects that impact the brain, heart, liver, and other important organs.",
        imageUrl:
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3",
        slug: "early-signs-of-drug-dependency",
      },
      {
        title: "Impact on Families",
        content:
          "Substance abuse affects not just the individual but entire families, creating stress, financial problems, and emotional trauma.",
        imageUrl:
          "https://images.unsplash.com/photo-1529180979161-06b8b6d6f2be?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        slug: "supporting-loved-ones-recovery",
      },
      {
        title: "Recovery Resources",
        content:
          "Recovery is possible with proper support and treatment. Many organizations in Baguio City offer help for those struggling with addiction.",
        imageUrl:
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3",
        slug: "treatment-options",
      },
      {
        title: "Talking to Teens About Drugs",
        content:
          "Effective communication strategies for parents to discuss substance abuse with adolescents in a way that builds trust and encourages open dialogue.",
        imageUrl:
          "https://plus.unsplash.com/premium_photo-1672292536198-86c3644c8530?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        slug: "talking-to-teens",
      },
      {
        title: "Workplace Drug Testing",
        content:
          "Implementing effective workplace drug testing programs that balance safety with respect for employee dignity.",
        imageUrl:
          "https://images.unsplash.com/photo-1521791136064-7986c2920216?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3",
        slug: "workplace-testing-program",
      },
    ];

    res.render("home/resources", {
      title: "Drug Awareness Resources",
      resources,
    });
  },

  /**
   * Render the blog post page
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getBlogPost: (req, res) => {
    const slug = req.params.slug;

    // Map of available blog posts with their corresponding EJS files
    const availablePosts = {
      "early-signs-of-drug-dependency": "early-signs",
      "workplace-testing-program": "workplace-testing",
      "supporting-loved-ones-recovery": "supporting-loved-ones",
      "treatment-options": "treatment-options",
      "talking-to-teens": "talking-to-teens",
      "science-of-addiction": "science-of-addiction",
      "philippines-drug-policy": "philippines-drug-policy",
      "employer-prevention-role": "employer-prevention-role",
    };

    // Check if the requested blog post exists
    if (availablePosts[slug]) {
      // Render the specific blog post
      try {
        // We don't need to pass any post object as each blog post template defines its own post object
        res.render(`home/blog-posts/${availablePosts[slug]}`, {
          title: `Blog Post - ${slug
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}`,
        });
      } catch (error) {
        console.error(`Error rendering blog post: ${slug}`, error);
        res.status(404).render("errors/404", {
          title: "Blog Post Not Found",
          path: req.path,
        });
      }
    } else {
      // Render default "coming soon" blog post template
      res.render("home/blog-posts/coming-soon", {
        title: "Blog Post Coming Soon",
        slug,
      });
    }
  },

  /**
   * Render the all articles page
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllArticles: (req, res) => {
    // Articles data with proper routes matching our created blog posts
    const articles = [
      {
        title: "Early Signs of Drug Dependency: What to Watch For",
        excerpt:
          "Recognizing the early warning signs of drug dependency can make a significant difference in timely intervention. Learn about behavioral, physical, and psychological indicators.",
        category: "Prevention",
        date: "March 10, 2025",
        imageUrl:
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3",
        slug: "early-signs-of-drug-dependency",
        readTime: 8,
      },
      {
        title: "Supporting a Loved One Through Recovery",
        excerpt:
          "Family support plays a crucial role in successful recovery. This guide provides practical advice for family members and friends on how to provide effective support.",
        category: "Recovery",
        date: "March 5, 2025",
        imageUrl:
          "https://images.unsplash.com/photo-1529180979161-06b8b6d6f2be?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        slug: "supporting-loved-ones-recovery",
        readTime: 7,
      },
      {
        title: "The Science Behind Addiction",
        excerpt:
          "Understanding the neurological and psychological mechanisms that drive addiction can help dispel myths and foster compassion for those struggling with substance use disorders.",
        category: "Education",
        date: "February 18, 2025",
        imageUrl:
          "https://plus.unsplash.com/premium_photo-1674491520278-f13635c36f93?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        slug: "science-of-addiction",
        readTime: 9,
      },
      {
        title: "Creating an Effective Workplace Drug Testing Program",
        excerpt:
          "Workplace drug testing programs need to balance thoroughness with sensitivity. Learn best practices for implementing a fair, consistent, and effective program.",
        category: "Workplace",
        date: "March 15, 2025",
        imageUrl:
          "https://images.unsplash.com/photo-1521791136064-7986c2920216?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3",
        slug: "workplace-testing-program",
        readTime: 10,
      },
      {
        title: "How to Talk to Teens About Drugs",
        excerpt:
          "Effective communication strategies for parents to discuss substance abuse with adolescents in a way that builds trust and encourages open dialogue.",
        category: "Prevention",
        date: "February 10, 2025",
        imageUrl:
          "https://plus.unsplash.com/premium_photo-1672292536198-86c3644c8530?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        slug: "talking-to-teens",
        readTime: 6,
      },
      {
        title: "Treatment Options in Baguio City: A Comprehensive Guide",
        excerpt:
          "A detailed overview of treatment and rehabilitation options available in Baguio City, including inpatient, outpatient, and support group resources.",
        category: "Treatment",
        date: "January 28, 2025",
        imageUrl:
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3",
        slug: "treatment-options",
        readTime: 8,
      },
      {
        title: "Current Drug Policy in the Philippines: What You Need to Know",
        excerpt:
          "Understanding the legal framework around drug use, possession, and rehabilitation in the Philippines is important for both prevention and seeking help.",
        category: "Policy",
        date: "February 25, 2025",
        imageUrl:
          "https://images.unsplash.com/photo-1448375240586-882707db888b?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3",
        slug: "philippines-drug-policy",
        readTime: 10,
      },
      {
        title: "The Role of Employers in Preventing Workplace Substance Abuse",
        excerpt:
          "Beyond testing: How employers can create supportive environments that prevent substance abuse and promote employee wellbeing.",
        category: "Workplace",
        date: "January 15, 2025",
        imageUrl:
          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3",
        slug: "employer-prevention-role",
        readTime: 7,
      },
    ];

    res.render("home/all-articles", {
      title: "All Articles",
      articles,
    });
  },

  /**
   * Handle the "coming soon" page for articles under development
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getComingSoon: (req, res) => {
    const slug = req.params.slug || "article";
    const formattedTitle = slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    res.render("home/blog-posts/coming-soon", {
      title: `${formattedTitle} - Coming Soon`,
      slug,
    });
  },
};

module.exports = resourcesController;
