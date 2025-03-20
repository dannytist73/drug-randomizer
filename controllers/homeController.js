/**
 * Controller for handling home page and informational content
 */
const homeController = {
  /**
   * Render the home/splash page
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getHomePage: (req, res) => {
    res.render("home/index", {
      title: "Drug Awareness and Testing Program",
      heroHeading: "Drug Awareness and Testing Program",
      heroSubheading: "Promoting a drug-free workplace and community",
    });
  },

  /**
   * Render the resources page with information about drug awareness
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getResourcesPage: (req, res) => {
    const resources = [
      {
        title: "Understanding Drug Addiction",
        content:
          "Drug addiction is a chronic disease characterized by drug seeking and use that is compulsive, or difficult to control, despite harmful consequences.",
        imageUrl: "/images/understanding-addiction.jpg",
      },
      {
        title: "Effects on Health",
        content:
          "Drug use can have short and long-term health effects that impact the brain, heart, liver, and other important organs.",
        imageUrl: "/images/health-effects.jpg",
      },
      {
        title: "Impact on Families",
        content:
          "Substance abuse affects not just the individual but entire families, creating stress, financial problems, and emotional trauma.",
        imageUrl: "/images/family-impact.jpg",
      },
      {
        title: "Recovery Resources",
        content:
          "Recovery is possible with proper support and treatment. Many organizations offer help for those struggling with addiction.",
        imageUrl: "/images/recovery.jpg",
      },
    ];

    res.render("home/resources", {
      title: "Drug Awareness Resources",
      resources,
    });
  },

  /**
   * Render the authorities page with contact information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAuthoritiesPage: (req, res) => {
    const authorities = [
      {
        name: "Philippine Drug Enforcement Agency (PDEA)",
        description:
          "The lead anti-drug law enforcement agency in the Philippines.",
        contact: "+63 (2) 8920-0967",
        email: "pdea.ippd@pdea.gov.ph",
        website: "https://pdea.gov.ph/",
        hotline: "#PDEA or 09998887332",
      },
      {
        name: "Dangerous Drugs Board (DDB)",
        description:
          "The policy-making and strategy-formulating body on drug prevention and control.",
        contact: "+63 (2) 8527-0857",
        email: "communications@ddb.gov.ph",
        website: "https://www.ddb.gov.ph/",
        hotline: "1365",
      },
      {
        name: "Department of Health (DOH)",
        description:
          "Provides treatment and rehabilitation programs for drug dependents.",
        contact: "+63 (2) 8651-7800",
        email: "callcenter@doh.gov.ph",
        website: "https://doh.gov.ph/",
        hotline: "1555",
      },
      {
        name: "Philippine National Police (PNP)",
        description: "Local law enforcement handling drug-related crimes.",
        contact: "117",
        email: "pnpo.adm@gmail.com",
        website: "https://pnp.gov.ph/",
        hotline: "117 or 911",
      },
    ];

    res.render("home/authorities", {
      title: "Contact Authorities",
      authorities,
    });
  },

  /**
   * Render the awareness page with educational content
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAwarenessPage: (req, res) => {
    const awarenessContent = {
      title: "Drug Awareness Education",
      intro:
        "Education is key to prevention. Learn about the dangers of drug abuse and how to recognize signs of addiction.",
      sections: [
        {
          title: "Warning Signs of Drug Use",
          points: [
            "Sudden changes in behavior or personality",
            "Decline in work or school performance",
            "Unexplained financial problems",
            "Physical changes like weight loss, red eyes, or poor hygiene",
            "Secretive behavior and isolation from friends and family",
            "Changes in sleep patterns or energy levels",
          ],
        },
        {
          title: "Common Drugs and Their Effects",
          drugs: [
            {
              name: "Methamphetamine (Shabu)",
              effects:
                "Increased energy, decreased appetite, irregular heartbeat, increased blood pressure, hyperthermia, insomnia",
            },
            {
              name: "Marijuana",
              effects:
                "Relaxation, altered perception, impaired memory and concentration, increased heart rate, anxiety, paranoia",
            },
            {
              name: "Cocaine",
              effects:
                "Euphoria, increased energy, restlessness, irritability, paranoia, increased heart rate and blood pressure",
            },
            {
              name: "Ecstasy (MDMA)",
              effects:
                "Euphoria, increased empathy, altered perception, increased heart rate and blood pressure, nausea, chills",
            },
          ],
        },
        {
          title: "Long-term Consequences",
          content:
            "Long-term drug use can lead to addiction, chronic health problems, financial difficulties, legal issues, damaged relationships, and loss of employment.",
        },
      ],
    };

    res.render("home/awareness", {
      title: "Drug Awareness Education",
      content: awarenessContent,
    });
  },
};

module.exports = homeController;
