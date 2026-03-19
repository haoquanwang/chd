// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
const navLinksItems = document.querySelectorAll('.nav-links a');

navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Contact Form Handling
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            company: document.getElementById('company').value,
            message: document.getElementById('message').value
        };

        // Validate form
        if (!formData.name || !formData.email || !formData.message) {
            alert('Please fill in all required fields.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Create mailto link
        const subject = `Contact from Website - ${formData.name}`;
        const body = `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nCompany: ${formData.company}\n\nMessage:\n${formData.message}`;
        const mailtoLink = `mailto:info@chdmanagement.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Open email client
        window.location.href = mailtoLink;

        // Show success message
        alert('Thank you for your message! Your email client should open shortly. If not, please email us directly at info@chdmanagement.co.uk');

        // Reset form
        contactForm.reset();
    });
}

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    }

    lastScroll = currentScroll;
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .news-card, .feature').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add active state to navigation links based on scroll position
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinksItems.forEach(link => link.classList.remove('active'));
            if (navLink) navLink.classList.add('active');
        }
    });
});

// RSS Feed Loading
const RSS_FEEDS = [
    {
        url: 'https://www.govwire.co.uk/rss/hm-revenue-customs',
        title: 'HM Revenue & Customs'
    },
    {
        url: 'https://www.govwire.co.uk/rss/government-internal-audit-agency',
        title: 'Government Internal Audit Agency'
    },
    {
        url: 'https://www.govwire.co.uk/rss/government-tax-profession',
        title: 'Government Tax Profession'
    }
];

// RSS2JSON API to fetch RSS feeds
async function fetchRSSFeed(feedUrl) {
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        return null;
    }
}

// Parse date from RSS feed item
function parseDateString(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    return { day, month };
}

// Create news card HTML
function createNewsCard(item, source) {
    const pubDate = item.pubDate ? parseDateString(item.pubDate) : { day: '', month: '' };
    const description = item.description
        ? item.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
        : 'Click to read more...';

    return `
        <article class="news-card">
            <div class="news-date">
                <span class="day">${pubDate.day}</span>
                <span class="month">${pubDate.month}</span>
            </div>
            <div class="news-content">
                <h3>${item.title}</h3>
                <p class="news-source">${source}</p>
                <p>${description}</p>
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="read-more">Read More →</a>
            </div>
        </article>
    `;
}

// Load RSS feeds
async function loadRSSFeeds() {
    const newsGrid = document.getElementById('newsGrid');
    const newsLoading = document.getElementById('newsLoading');

    if (!newsGrid || !newsLoading) return;

    const allItems = [];

    try {
        // Fetch all feeds in parallel
        const feedPromises = RSS_FEEDS.map(feed => fetchRSSFeed(feed.url));
        const feedResults = await Promise.all(feedPromises);

        // Combine all items from all feeds
        feedResults.forEach((result, index) => {
            if (result && result.status === 'ok' && result.items) {
                const source = RSS_FEEDS[index].title;
                result.items.forEach(item => {
                    allItems.push({ ...item, source });
                });
            }
        });

        if (allItems.length === 0) {
            newsGrid.innerHTML = '<p class="news-error">Unable to load news at this time. Please try again later.</p>';
            return;
        }

        // Sort by date (newest first)
        allItems.sort((a, b) => {
            const dateA = new Date(a.pubDate || 0);
            const dateB = new Date(b.pubDate || 0);
            return dateB - dateA;
        });

        // Limit to 8 most recent items
        const recentItems = allItems.slice(0, 8);

        // Generate HTML
        const newsHTML = recentItems.map(item => createNewsCard(item, item.source)).join('');
        newsGrid.innerHTML = newsHTML;

        // Observe new news cards for animation
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        newsGrid.querySelectorAll('.news-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });

    } catch (error) {
        console.error('Error loading RSS feeds:', error);
        newsGrid.innerHTML = '<p class="news-error">Unable to load news at this time. Please try again later.</p>';
    } finally {
        newsLoading.style.display = 'none';
    }
}

// Load feeds when page loads
document.addEventListener('DOMContentLoaded', loadRSSFeeds);

console.log('CHD Management website loaded successfully');
