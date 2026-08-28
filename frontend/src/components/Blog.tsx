import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Box, Flex, Heading, Text, Button, Grid, GridItem, Image, Input } from "@chakra-ui/react";

// ── Expressive Typography Animation styles injected once ──────────────────
const BLOG_STYLES = `
  @keyframes textReveal {
    from { clip-path: inset(0 100% 0 0); opacity: 0; }
    to   { clip-path: inset(0 0% 0 0);   opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateY(40px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes charDrop {
    from { transform: translateY(-60px) rotate(-8deg); opacity: 0; }
    to   { transform: translateY(0)     rotate(0deg);  opacity: 1; }
  }
  @keyframes lineGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes tagPop {
    0%   { transform: scale(0.6) rotate(-6deg); opacity: 0; }
    70%  { transform: scale(1.1) rotate(2deg);  opacity: 1; }
    100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes fadeSlideIn {
    from { transform: translateY(24px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .blog-char {
    display: inline-block;
    animation: charDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .blog-reveal {
    animation: textReveal 0.7s cubic-bezier(0.77,0,0.18,1) both;
  }
  .blog-slideup {
    animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }
  .blog-line {
    transform-origin: left;
    animation: lineGrow 0.6s cubic-bezier(0.77,0,0.18,1) both;
  }
  .blog-tag {
    animation: tagPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .blog-fadein {
    animation: fadeSlideIn 0.5s ease both;
  }

  /* Hover: title underline draw */
  .post-card .post-title {
    background-image: linear-gradient(#111, #111);
    background-size: 0% 2px;
    background-repeat: no-repeat;
    background-position: 0 100%;
    transition: background-size 0.4s ease;
  }
  .post-card:hover .post-title {
    background-size: 100% 2px;
  }

  /* Hover: image zoom */
  .post-card .post-img {
    transition: transform 0.7s cubic-bezier(0.22,1,0.36,1);
  }
  .post-card:hover .post-img {
    transform: scale(1.06);
  }

  /* Marquee ticker */
  .marquee-track {
    display: flex;
    width: max-content;
    animation: marquee 18s linear infinite;
  }
  .marquee-track:hover { animation-play-state: paused; }
`;

// Animated heading — each character drops in with stagger
function AnimatedHeading({ text, delay = 0 }: { text: string; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <Box ref={ref} display="inline-block">
      {text.split("").map((ch, i) => (
        <Box
          key={i} as="span"
          className={visible ? "blog-char" : ""}
          style={{ animationDelay: `${delay + i * 0.04}s`, opacity: visible ? undefined : 0 }}
        >
          {ch === " " ? "\u00a0" : ch}
        </Box>
      ))}
    </Box>
  );
}

// Reveal-on-scroll wrapper
function Reveal({ children, delay = 0, className = "blog-slideup" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <Box ref={ref} className={visible ? className : ""} style={{ opacity: visible ? undefined : 0, animationDelay: `${delay}s` }}>
      {children}
    </Box>
  );
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const categoryColors: Record<string, string> = {
  CRAFT: "#4ade80",
  WEDDINGS: "#f9a8d4",
  PORTRAITS: "#fbbf24",
  FILM: "#818cf8",
  EDITING: "#fb923c",
};

export function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  useEffect(() => {
    fetch(`${API}/blog`)
      .then(r => r.json())
      .then(({ posts: fetched }) => { setPosts(fetched || []); })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["ALL", "CRAFT", "WEDDINGS", "PORTRAITS", "FILM", "EDITING", "BEHIND THE SCENES"];
  const filtered = activeCategory === "ALL" ? posts : posts.filter(p => p.category === activeCategory);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await fetch(`${API}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      toast.success("You're subscribed! Stay inspired.");
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
    setNewsletterEmail("");
  };

  return (
    <Box as="section" minH="100vh" bg="#0c0c0c" color="white" pt={24} pb={20}>
      <style>{BLOG_STYLES}</style>

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <Box maxW="7xl" mx="auto" px={{ base: 4, lg: 8 }} mb={16}>
        <Flex align="flex-end" justify="space-between" flexWrap="wrap" gap={6}>
          <Box>
            <Box mb={3}>
              <Text
                fontSize="xs" fontWeight="700" letterSpacing="0.4em" color="green.400"
                className="blog-reveal" style={{ animationDelay: "0.1s" }}
              >
                GRAMTIME VISUALS — JOURNAL
              </Text>
            </Box>

            {/* Giant expressive heading */}
            <Box lineHeight="0.9" mb={4}>
              <Box fontSize={{ base: "6xl", md: "9xl" }} fontWeight="900" letterSpacing="-0.04em" display="block">
                <AnimatedHeading text="THE" delay={0.2} />
              </Box>
              <Flex align="center" gap={4}>
                <Box fontSize={{ base: "6xl", md: "9xl" }} fontWeight="900" letterSpacing="-0.04em" color="green.400">
                  <AnimatedHeading text="LENS" delay={0.4} />
                </Box>
                {/* Italic serif accent */}
                <Box
                  fontSize={{ base: "3xl", md: "5xl" }} fontWeight="300"
                  fontStyle="italic" color="gray.500" mt={2}
                  className="blog-fadein" style={{ animationDelay: "0.8s", opacity: 0 }}
                >
                  &amp; the story
                </Box>
              </Flex>
            </Box>

            {/* Animated underline */}
            <Box h="3px" bg="green.400" w="200px" className="blog-line" style={{ animationDelay: "0.9s" }} />
          </Box>

          <Reveal delay={0.5} className="blog-fadein">
            <Text color="gray.400" fontSize="sm" fontWeight="300" maxW="xs" lineHeight="1.8">
              Insights, inspiration, and stories from behind the lens. Updated weekly.
            </Text>
          </Reveal>
        </Flex>
      </Box>

      {/* ── MARQUEE TICKER ──────────────────────────────────────────── */}
      <Box overflow="hidden" borderTop="1px solid" borderBottom="1px solid" borderColor="gray.800" py={3} mb={16}>
        <Box className="marquee-track">
          {[...Array(2)].map((_, ri) => (
            <Flex key={ri} gap={8} px={8} align="center" flexShrink={0}>
              {["Wedding Photography", "Portrait Sessions", "Drone Coverage", "Color Grading", "Event Films", "Studio Shoots", "Engagement Sessions", "Behind the Scenes"].map((item) => (
                <Text key={item} fontSize="xs" fontWeight="600" letterSpacing="0.2em" color="gray.400" textTransform="uppercase" whiteSpace="nowrap" flexShrink={0}>
                  {item}
                </Text>
              ))}
            </Flex>
          ))}
        </Box>
      </Box>

      <Box maxW="7xl" mx="auto" px={{ base: 4, lg: 8 }}>

        {/* ── CATEGORY FILTER ─────────────────────────────────────────── */}
        <Reveal delay={0.1}>
          <Flex gap={3} mb={12} flexWrap="wrap">
            {categories.map((cat, i) => (
              <Box
                key={cat}
                as="button"
                onClick={() => setActiveCategory(cat)}
                px={4} py={2}
                fontSize="xs" fontWeight="700" letterSpacing="0.15em"
                border="1px solid"
                borderColor={activeCategory === cat ? "green.400" : "gray.700"}
                color={activeCategory === cat ? "black" : "gray.400"}
                bg={activeCategory === cat ? "green.400" : "transparent"}
                borderRadius="full"
                cursor="pointer"
                transition="all 0.2s"
                style={{ animationDelay: `${i * 0.05}s` }}
                className="blog-tag"
                _hover={{ borderColor: "green.400", color: "green.400" }}
              >
                {cat}
              </Box>
            ))}
          </Flex>
        </Reveal>

        {/* ── EMPTY / LOADING STATE ────────────────────────────────────── */}
        {loading && (
          <Flex justify="center" align="center" minH="300px">
            <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em" color="green.400"
              style={{ fontFamily: "monospace", animation: "fadeSlideIn 0.5s ease both" }}>
              LOADING JOURNAL...
            </Text>
          </Flex>
        )}

        {!loading && posts.length === 0 && (
          <Flex justify="center" align="center" minH="300px" direction="column" gap={3}>
            <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em" color="gray.600"
              style={{ fontFamily: "monospace" }}>
              NO ARTICLES YET
            </Text>
            <Text fontSize="sm" color="gray.700" fontWeight="300">
              Journal posts published from the admin panel will appear here.
            </Text>
          </Flex>
        )}

        {/* ── FEATURED POST (BENTO HERO TILE) ─────────────────────────── */}
        {!loading && filtered.length > 0 && (
        <Reveal delay={0.1} className="blog-fadein">
          <Box
            className="post-card"
            position="relative" overflow="hidden" borderRadius="2xl" mb={6}
            cursor="pointer" bg="#111"
            border="1px solid" borderColor="gray.800"
            _hover={{ borderColor: "green.500" }}
            transition="border-color 0.3s"
          >
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} minH="480px">
              <Box overflow="hidden" position="relative">
                <Image
                  src={filtered[0].featuredImageUrl} alt={filtered[0].title}
                  w="full" h="full" objectFit="cover" minH="320px"
                  className="post-img"
                />
                <Box
                  position="absolute" inset={0}
                  style={{ background: "linear-gradient(to right, transparent 60%, #111 100%)" }}
                  display={{ base: "none", lg: "block" }}
                />
              </Box>
              <Flex direction="column" justify="space-between" p={{ base: 8, lg: 12 }}>
                <Box>
                  <Flex align="center" gap={3} mb={6}>
                    <Box
                      px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="700" letterSpacing="0.15em"
                      style={{ background: categoryColors[filtered[0].category] || "#4ade80", color: "#000" }}
                    >
                      {filtered[0].category}
                    </Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="400">{filtered[0].readTime}</Text>
                  </Flex>
                  <Heading
                    fontSize={{ base: "2xl", md: "4xl" }} fontWeight="800"
                    letterSpacing="-0.02em" lineHeight="1.1" color="white" mb={4}
                    className="post-title"
                  >
                    {filtered[0].title}
                  </Heading>
                  <Text color="gray.400" fontSize="md" fontWeight="300" lineHeight="1.8" mb={6}>
                    {filtered[0].excerpt}
                  </Text>
                  <Flex gap={2} flexWrap="wrap" mb={8}>
                    {filtered[0].tags.map((tag: string) => (
                      <Text key={tag} fontSize="xs" color="gray.600" fontWeight="500" letterSpacing="0.1em">#{tag}</Text>
                    ))}
                  </Flex>
                </Box>
                <Flex align="center" justify="space-between">
                  <Text fontSize="xs" color="gray.600" fontWeight="400">{fmtDate(filtered[0].publishDate)}</Text>
                  <Box
                    as="button" px={6} py={3} bg="green.400" color="black" fontWeight="700"
                    fontSize="xs" letterSpacing="0.15em" borderRadius="full"
                    transition="all 0.2s" _hover={{ bg: "green.300", transform: "translateY(-2px)" }}
                  >
                    READ ARTICLE →
                  </Box>
                </Flex>
              </Flex>
            </Grid>
          </Box>
        </Reveal>
        )}

        {/* ── BENTO GRID — remaining posts ────────────────────────────── */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(6, 1fr)" }} gap={4} mb={16}>

          {/* Post 2 — tall left (3 cols) */}
          {filtered.slice(1, 2).map((post) => (
            <GridItem key={post.id} colSpan={{ base: 1, md: 3 }}>
              <Reveal delay={0.1} className="blog-fadein">
                <Box
                  className="post-card" h="full" minH="420px" borderRadius="2xl"
                  overflow="hidden" position="relative" cursor="pointer"
                  bg="#111" border="1px solid" borderColor="gray.800"
                  _hover={{ borderColor: "green.500" }} transition="border-color 0.3s"
                >
                  <Box h="260px" overflow="hidden">
                    <Image src={post.featuredImageUrl} alt={post.title} w="full" h="full" objectFit="cover" className="post-img" />
                  </Box>
                  <Box p={7}>
                    <Flex align="center" gap={3} mb={4}>
                      <Box px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="700" letterSpacing="0.15em"
                        style={{ background: categoryColors[post.category] || "#4ade80", color: "#000" }}>
                        {post.category}
                      </Box>
                      <Text fontSize="xs" color="gray.500">{post.readTime}</Text>
                    </Flex>
                    <Heading fontSize="xl" fontWeight="800" letterSpacing="-0.02em" color="white" mb={3} className="post-title">
                      {post.title}
                    </Heading>
                    <Text color="gray.500" fontSize="sm" fontWeight="300" lineHeight="1.7" mb={4}>{post.excerpt}</Text>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" color="gray.600">{fmtDate(post.publishDate)}</Text>
                      <Text fontSize="xs" color="green.400" fontWeight="600" cursor="pointer">READ →</Text>
                    </Flex>
                  </Box>
                </Box>
              </Reveal>
            </GridItem>
          ))}

          {/* Post 3 — tall right (3 cols) */}
          {filtered.slice(2, 3).map((post) => (
            <GridItem key={post.id} colSpan={{ base: 1, md: 3 }}>
              <Reveal delay={0.2} className="blog-fadein">
                <Box
                  className="post-card" h="full" minH="420px" borderRadius="2xl"
                  overflow="hidden" position="relative" cursor="pointer"
                  style={{ background: categoryColors[post.category] || "#4ade80" }}
                  _hover={{ transform: "translateY(-4px)" }} transition="transform 0.3s"
                >
                  <Box h="260px" overflow="hidden">
                    <Image src={post.featuredImageUrl} alt={post.title} w="full" h="full" objectFit="cover" className="post-img" />
                  </Box>
                  <Box p={7}>
                    <Flex align="center" gap={3} mb={4}>
                      <Box px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="700" letterSpacing="0.15em" bg="black" color="white">
                        {post.category}
                      </Box>
                      <Text fontSize="xs" color="blackAlpha.700" fontWeight="500">{post.readTime}</Text>
                    </Flex>
                    <Heading fontSize="xl" fontWeight="800" letterSpacing="-0.02em" color="black" mb={3} className="post-title" style={{ backgroundImage: "linear-gradient(#000,#000)" }}>
                      {post.title}
                    </Heading>
                    <Text color="blackAlpha.700" fontSize="sm" fontWeight="400" lineHeight="1.7" mb={4}>{post.excerpt}</Text>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" color="blackAlpha.600">{fmtDate(post.publishDate)}</Text>
                      <Text fontSize="xs" color="black" fontWeight="700" cursor="pointer">READ →</Text>
                    </Flex>
                  </Box>
                </Box>
              </Reveal>
            </GridItem>
          ))}

          {/* Posts 4 & 5 — wide short tiles (3 cols each) */}
          {filtered.slice(3, 5).map((post, i) => (
            <GridItem key={post.id} colSpan={{ base: 1, md: 3 }}>
              <Reveal delay={0.1 + i * 0.1} className="blog-fadein">
                <Box
                  className="post-card" borderRadius="2xl" overflow="hidden"
                  cursor="pointer" bg="#111" border="1px solid" borderColor="gray.800"
                  _hover={{ borderColor: "green.500" }} transition="border-color 0.3s"
                >
                  <Grid templateColumns="140px 1fr">
                    <Box overflow="hidden" h="full" minH="140px">
                      <Image src={post.featuredImageUrl} alt={post.title} w="full" h="full" objectFit="cover" className="post-img" />
                    </Box>
                    <Box p={5}>
                      <Flex align="center" gap={2} mb={3}>
                        <Box px={2} py={0.5} borderRadius="full" fontSize="10px" fontWeight="700" letterSpacing="0.1em"
                          style={{ background: categoryColors[post.category] || "#4ade80", color: "#000" }}>
                          {post.category}
                        </Box>
                        <Text fontSize="10px" color="gray.600">{post.readTime}</Text>
                      </Flex>
                      <Heading fontSize="md" fontWeight="700" letterSpacing="-0.01em" color="white" mb={2} lineHeight="1.3" className="post-title">
                        {post.title}
                      </Heading>
                      <Text color="gray.500" fontSize="xs" fontWeight="300" lineHeight="1.6" mb={3} noOfLines={2}>{post.excerpt}</Text>
                      <Flex justify="space-between" align="center">
                        <Text fontSize="10px" color="gray.600">{fmtDate(post.publishDate)}</Text>
                        <Text fontSize="xs" color="green.400" fontWeight="600">READ →</Text>
                      </Flex>
                    </Box>
                  </Grid>
                </Box>
              </Reveal>
            </GridItem>
          ))}

          {/* Quote tile — 6 cols full width */}
          <GridItem colSpan={{ base: 1, md: 6 }}>
            <Reveal delay={0.2} className="blog-fadein">
              <Box
                borderRadius="2xl" p={{ base: 8, md: 12 }}
                style={{ background: "linear-gradient(135deg, #0d2818 0%, #111 100%)" }}
                border="1px solid" borderColor="green.900"
                position="relative" overflow="hidden"
              >
                <Box position="absolute" top="-40px" right="-40px" w="200px" h="200px" borderRadius="full"
                  style={{ background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)" }} />
                <Flex align="center" justify="space-between" flexWrap="wrap" gap={6} position="relative">
                  <Box maxW="2xl">
                    <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em" color="green.600" mb={3}>EDITOR'S NOTE</Text>
                    <Box fontSize={{ base: "2xl", md: "4xl" }} fontWeight="800" letterSpacing="-0.02em" lineHeight="1.2" color="white">
                      <AnimatedHeading text='"Every frame tells' delay={0.1} />
                      <br />
                      <Box as="span" color="green.400">
                        <AnimatedHeading text="a story worth" delay={0.3} />
                      </Box>
                      <br />
                      <AnimatedHeading text='keeping."' delay={0.5} />
                    </Box>
                  </Box>
                  <Box textAlign={{ base: "left", md: "right" }}>
                    <Text fontSize="sm" color="gray.500" fontWeight="300" mb={1}>— Gramtime Visuals</Text>
                    <Text fontSize="xs" color="gray.600">Est. 2014 · Accra, Ghana</Text>
                  </Box>
                </Flex>
              </Box>
            </Reveal>
          </GridItem>
        </Grid>

        {/* ── NEWSLETTER BENTO TILE ────────────────────────────────────── */}
        <Reveal delay={0.1} className="blog-fadein">
          <Box borderRadius="2xl" overflow="hidden" mb={8}>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }}>
              {/* Left — expressive text */}
              <Box bg="green.400" p={{ base: 8, md: 12 }} position="relative" overflow="hidden">
                <Box position="absolute" bottom="-30px" left="-30px" w="160px" h="160px" borderRadius="full"
                  style={{ background: "rgba(0,0,0,0.08)" }} />
                <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em" color="green.900" mb={4}>STAY INSPIRED</Text>
                <Box fontSize={{ base: "3xl", md: "5xl" }} fontWeight="900" letterSpacing="-0.03em" lineHeight="1" color="black" mb={4}>
                  <AnimatedHeading text="Words." delay={0.1} />
                  <br />
                  <AnimatedHeading text="Weekly." delay={0.3} />
                </Box>
                <Text fontSize="sm" color="green.900" fontWeight="500" lineHeight="1.7">
                  Behind-the-scenes stories, photography tips, and exclusive early access — straight to your inbox.
                </Text>
              </Box>

              {/* Right — form */}
              <Box bg="#111" p={{ base: 8, md: 12 }} border="1px solid" borderColor="gray.800">
                <Text fontSize="xs" fontWeight="700" letterSpacing="0.3em" color="gray.500" mb={6}>JOIN THE CIRCLE</Text>
                <Box as="form" onSubmit={handleSubscribe}>
                  <Box
                    border="1px solid" borderColor="gray.700" borderRadius="xl"
                    overflow="hidden" display="flex" mb={4}
                    _focusWithin={{ borderColor: "green.400" }} transition="border-color 0.2s"
                  >
                    <Input
                      type="email" value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="your@email.com" required
                      bg="transparent" border="none" color="white"
                      px={5} py={4} fontSize="sm" fontWeight="400"
                      _placeholder={{ color: "gray.600" }} _focus={{ outline: "none", boxShadow: "none" }}
                      flex="1"
                    />
                    <Button
                      type="submit" bg="green.400" color="black" fontWeight="700"
                      fontSize="xs" letterSpacing="0.1em" px={6} borderRadius="none"
                      _hover={{ bg: "green.300" }} flexShrink={0}
                    >
                      JOIN →
                    </Button>
                  </Box>
                  <Text fontSize="xs" color="gray.600" fontWeight="300">No spam. Unsubscribe anytime.</Text>
                </Box>
              </Box>
            </Grid>
          </Box>
        </Reveal>

      </Box>
    </Box>
  );
}
