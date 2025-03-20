/**
 * Authentication middleware to protect admin routes
 */
const authMiddleware = {
  /**
   * Check if user is authenticated before allowing access to protected routes
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  isAuthenticated: (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
      return next();
    }

    // Store the original URL they were trying to access
    req.session.returnTo = req.originalUrl;

    // Redirect to login page
    res.redirect("/admin/login");
  },
};

module.exports = authMiddleware;
