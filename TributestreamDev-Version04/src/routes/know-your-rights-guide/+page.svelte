<script lang="ts">
  import TableOfContents from '$lib/components/table-of-contents.svelte';
  import ContentSection from '$lib/components/content-section.svelte';
  import type { TocItem } from '$lib/types/components';
  
  // State for active section (for TOC highlighting)
  let activeSection = $state('introduction');
  
  // Table of contents structure
  const tocItems: TocItem[] = [
    {
      id: 'introduction',
      title: 'Introduction',
      level: 1,
    },
    {
      id: 'design-inspiration',
      title: 'Design Inspiration from Civil Rights & Legal Aid Websites',
      level: 2,
    },
    {
      id: 'accessibility',
      title: 'Accessibility Best Practices (WCAG 2.1 AA)',
      level: 2,
    },
    {
      id: 'content-sections',
      title: 'Common Content Sections to Include',
      level: 2,
    },
    {
      id: 'tech-stack',
      title: 'Tech Stack Suggestions',
      level: 2,
    },
    {
      id: 'multilingual',
      title: 'Multilingual Support and Trusted Translation Workflow',
      level: 2,
    },
    {
      id: 'open-licensing',
      title: 'Open Licensing and Content Sharing',
      level: 2,
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      level: 2,
    },
    {
      id: 'sources',
      title: 'Sources and Examples',
      level: 2,
    }
  ];

  // Update active section based on scroll position
  function updateActiveSection() {
    const sections = document.querySelectorAll('.content-section');
    let currentSection = 'introduction';
    
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100) {
        currentSection = section.id;
      }
    });
    
    activeSection = currentSection;
  }

  // Set up scroll event listener when component mounts
  let scrollHandler: () => void;
  
  $effect(() => {
    scrollHandler = () => {
      requestAnimationFrame(updateActiveSection);
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
  });
</script>

<svelte:head>
  <title>Know Your Rights - Comprehensive Immigration Guide</title>
  <meta name="description" content="A comprehensive guide for building a 'Know Your Rights' website focused on immigration-related scenarios, covering design inspiration, accessibility, content sections, tech stack, multilingual support, and open licensing." />
</svelte:head>

<div class="guide-container">
  <header class="guide-header">
    <h1>Building a "Know Your Rights" Immigration Website</h1>
    <p class="guide-subtitle">A comprehensive guide for creating accessible, multilingual rights information</p>
    <a href="/" class="back-link">← Back to Interactive Guide</a>
  </header>

  <div class="guide-content">
    <aside class="toc-container">
      <TableOfContents items={tocItems} activeSection={activeSection} />
    </aside>

    <main class="main-content">
      <ContentSection id="introduction" title="Introduction" level={2}>
        <p>
          Every person in the U.S. – regardless of immigration status – has certain constitutional rights.
          A "Know Your Rights" website empowers immigrants with information on asserting those rights during
          encounters with immigration or law enforcement. Below, we outline best practices and examples for
          designing such a site, covering inspiring designs from civil rights and legal aid organizations,
          accessibility guidelines (WCAG 2.1 AA), essential content sections, tech stack recommendations,
          multilingual support, and open licensing considerations.
        </p>
      </ContentSection>

      <ContentSection id="design-inspiration" title="Design Inspiration from Civil Rights & Legal Aid Websites" level={2}>
        <p>
          Drawing inspiration from existing advocacy websites can guide both the look and feel and the user
          experience of your project:
        </p>

        <ul>
          <li>
            <strong>ACLU "Know Your Rights" Pages:</strong> The ACLU's site organizes immigrant rights
            information by scenario (e.g. being asked about immigration status, what to do if ICE comes to
            your home) with clear, plain-language headings and lists. Each scenario includes sub-sections
            like "How to reduce risk," "Your rights," and "What to do," making it easy to follow step-by-step
            guidance. The ACLU also provides a Spanish version via a toggle at the top, ensuring language
            accessibility without needing a separate site.
          </li>
          
          <li>
            <strong>"We Have Rights" Campaign:</strong> This collaborative campaign (by Brooklyn Defender
            Services, ACLU, Immigrant Defense Project, etc.) uses <strong>animated videos</strong> and
            graphics to illustrate rights during ICE encounters. The site presents information in an engaging
            video format, available in <strong>multiple languages</strong> (originally 7 languages, later
            expanded to 8) to reach diverse communities. This demonstrates how multimedia design (short
            animated explainers) can make legal information more approachable and shareable (the videos have
            been viewed millions of times).
          </li>
          
          <li>
            <strong>Informed Immigrant Resource Library:</strong> Informed Immigrant's website offers a
            structured library of guides for immigrants. Their <strong>"Know Your Rights" guide</strong> is
            broken into sections by topic (e.g. rights at home, rights outside, what to do if arrested,
            family preparedness) for easy navigation. A prominent language toggle switches to a full Spanish
            version of the site (on a dedicated Spanish domain), showing a model for maintaining parallel
            English/Spanish content. The design emphasizes clarity: an overview summarizing why it's important
            to learn and practice your rights in various scenarios, followed by a table of contents so users
            can jump to relevant topics.
          </li>
          
          <li>
            <strong>Immigrant Defense Project (IDP):</strong> IDP's <strong>Know Your Rights with ICE</strong>
            page provides information in a highly visual way. It features infographics and downloadable
            flyers/posters illustrating key points (e.g. "Who is at risk of an ICE arrest?", "What to do if
            ICE is at your door"). These visuals use bold text and icons to convey crucial tips at a glance.
            The site also offers materials in many languages; for example, their general KYR flyer is available
            in 17 languages as of 2025. Design-wise, this shows the value of using icons, infographics, and
            color to highlight important guidance, ensuring even users with lower literacy or limited time can
            grasp the essentials quickly.
          </li>
          
          <li>
            <strong>Legal Aid and Community Orgs:</strong> Many local immigrant rights groups provide simple
            one-page guides or <strong>printable wallet cards</strong>. For instance, the Immigrant Legal
            Resource Center's "Red Cards" (business-card-sized know-your-rights cards) are a widely used
            design idea – small cards printed with key rights statements that an individual can hand to an
            officer or keep for reference. Your site could incorporate this idea by offering downloadable
            cards or scripts in PDF form. Ensure the design for these printables is clean and legible (ILRC
            recommends high-contrast, durable cards that stand out in a wallet).
          </li>
        </ul>

        <p>
          In summary, effective designs tend to use <strong>clear navigation</strong>, scenario-based
          organization, and visual aids (videos, infographics, icons) to make the information accessible.
          They also prominently feature language toggles or mirrored sites for non-English content. Draw
          from these examples to create a site that is <strong>easy to scan, visually engaging, and
          immediately useful</strong> to its audience.
        </p>
      </ContentSection>

      <ContentSection id="accessibility" title="Accessibility Best Practices (WCAG 2.1 AA)" level={2}>
        <p>
          Ensuring the site meets <strong>WCAG 2.1 Level AA</strong> standards is crucial so that people of
          all abilities (including those with disabilities or using assistive tech) can access the information.
          Key accessibility best practices include:
        </p>

        <ul>
          <li>
            <strong>Provide Text Alternatives for All Media:</strong> All non-text content (images, graphics,
            videos) should have descriptive <strong>alt text</strong> or captions. This allows screen readers
            to convey the content to visually impaired users. For videos or audio (e.g. explanatory clips),
            provide synchronized captions or text transcripts so deaf or hard-of-hearing users can get the
            information.
          </li>
          
          <li>
            <strong>Ensure Strong Contrast and Readability:</strong> Use high-contrast color combinations for
            text and background to aid readability (especially for users with low vision or color blindness).
            Choose clean, legible fonts and sufficient text size. Avoid color-coding information without also
            providing text or icons, since not everyone perceives colors the same way.
          </li>
          
          <li>
            <strong>Keyboard Navigation and Other Inputs:</strong> All site functionality should be accessible
            via keyboard alone (not just a mouse). Users should be able to use the <strong>Tab key</strong> to
            navigate through menus and links, and activate controls with Enter/Space. This benefits users with
            motor disabilities or those using screen readers. Also consider other input modalities – e.g.
            ensuring the site works with voice control or switch devices – to the extent possible.
          </li>
          
          <li>
            <strong>Consistent Layout and Structure:</strong> Use a consistent navigation menu and page layout
            across the site to avoid confusion. Headings should be properly tagged (H1, H2, etc.) in a logical
            hierarchy so screen reader users can understand page structure. For example, use clear section
            headers like "Your Rights" or "What To Do" for each scenario consistently. Repeating menu items
            (home, contact, language switch, etc.) in the same order on every page helps users orient themselves.
          </li>
          
          <li>
            <strong>Avoid Hazardous Content:</strong> Do <strong>not</strong> include elements that flash or
            strobe rapidly, as these can trigger seizures or migraines. WCAG guidelines say nothing on the page
            should flash more than three times in any 1-second period. If using any animation, provide a way to
            pause or stop it.
          </li>
          
          <li>
            <strong>User Control and Error Handling:</strong> If any interactive component has a time limit
            (for example, a quiz or form), allow users to extend or disable the timeout. Provide helpful error
            messages for forms (e.g. if a required field is empty or an email is formatted incorrectly) and
            make the message easy to identify. The user should be informed what went wrong <strong>and how to
            fix it</strong>. For instance, if a phone number field is wrong, an error might say "Please enter
            a 10-digit phone number." This guidance helps users with cognitive disabilities or anyone who might
            be confused by the form.
          </li>
          
          <li>
            <strong>Use Plain Language:</strong> Write the content in simple, clear language. Legal information
            can be complex, so strive to explain rights in everyday terms and short sentences. Avoid jargon or
            explain it when unavoidable. This aligns with WCAG's <strong>"Understandable"</strong> principle –
            content should be readable by a wide audience. It also helps readers whose first language isn't
            English or who have lower literacy.
          </li>
        </ul>

        <p>
          By following these practices, you make sure the site is <strong>perceivable, operable, understandable,
          and robust</strong> for all users (the four guiding principles of accessibility, often called
          <strong>POUR</strong>). An accessible know-your-rights site not only broadens your reach, it also
          reflects the inclusive spirit of the project – everyone should be able to learn about their rights.
        </p>
      </ContentSection>

      <ContentSection id="content-sections" title="Common Content Sections to Include" level={2}>
        <p>
          A "Know Your Rights" immigration site typically needs to cover a range of scenarios and provide
          actionable guidance. Common content sections and features include:
        </p>

        <ul>
          <li>
            <strong>Rights Scenarios and Guidance:</strong> Break down rights information by scenario or
            context. For example, sections might include <strong>"Your Rights at Home," "Your Rights in
            Public," "During a Traffic Stop," "At the Airport/Border,"</strong> etc. In each scenario,
            outline what the person should do (or not do), and what their legal rights are. The ACLU's
            immigrant rights guide uses this approach, detailing how to respond if police or ICE come to
            your home, what to do if you're stopped on the street, and so on. The Informed Immigrant guide
            similarly covers <em>Rights inside your home vs. outside</em>, preparing for an immigration raid,
            and what to do if you or someone you know is arrested. Organizing by real-life situations helps
            users quickly find advice tailored to that situation.
          </li>
          
          <li>
            <strong>Prepared Scripts or "Red Cards":</strong> It's helpful to provide exact <strong>phrases
            or statements</strong> people can use when confronted by authorities. Many KYR resources include
            a script – for instance: "I am exercising my right to remain silent. I would like to speak to an
            attorney." Consider having a section like "What to Say (Scripts)" with these key phrases. The
            <strong>Red Card</strong> concept is a great example: a small card that states the bearer's rights
            and a request for a lawyer, which an individual can hand to an ICE agent or police officer. One
            guide explains that red cards are "printed with your rights under the Constitution, and a statement
            that you are exercising your right to remain silent". Your site can offer downloadable
            <strong>Know-Your-Rights cards</strong> in PDF form (for various languages) or at least show the
            text that users should memorize or carry. Make sure to explain how to use them (e.g. <em>"If an
            ICE officer approaches you, you can hand them this card through the door or show it to them,
            instead of verbally answering questions."</em>).
          </li>
          
          <li>
            <strong>State-Specific Legal Differences:</strong> Immigration enforcement is federal, but certain
            rights-related laws vary by state (for example, some states have "stop and identify" laws requiring
            you to give your name if asked by police, while others don't). If your site serves a national
            audience, include notes or an interactive map about <strong>state-specific laws</strong>. For
            instance, the ACLU notes that <em>"In some states, you must provide your name to law enforcement
            if stopped, but even if you do, you don't have to answer other questions"</em>. A section on
            "Know Your Rights in [State]" or a tool to select your state can be valuable if those differences
            are significant. At minimum, add footnotes or parentheses in your content when advice might change
            in certain states (and consider linking to an external resource that keeps track of state laws).
          </li>
          
          <li>
            <strong>Emergency Planning and Family Preparedness:</strong> Many immigrant rights orgs stress
            preparing <strong>in advance</strong> for encounters or potential detention. Include content on
            making an emergency plan: for example, <em>"How to Prepare for an Immigration Raid"</em> (as
            Informed Immigrant's guide does) or <em>"How to Prepare Your Family if You are Detained"</em>.
            This can cover designating emergency contacts, power of attorney for child custody, securing
            important documents, and saving money for bail or legal fees. Having a checklist or toolkit for
            family preparedness (documents to gather, emergency phone numbers, plan for care of children or
            pets, etc.) is extremely useful.
          </li>
          
          <li>
            <strong>What to Do If You Are Detained/Arrested:</strong> A dedicated section should walk through
            the steps someone (or their family) should take if the person is arrested or detained by ICE. This
            might include information on the detainee's right to a phone call, not signing anything without a
            lawyer, how to find legal representation, and how family members can locate a person in ICE custody.
            (For example: <em>"If you are arrested or detained, say you wish to remain silent and ask for a
            lawyer immediately. Don't sign any documents without a lawyer's advice."</em>). Also, instruct
            family or witnesses on documenting the arrest (names or badge numbers of agents, time, location)
            and who to call for help.
          </li>
          
          <li>
            <strong>Contact Information and Help Lines:</strong> Provide a readily visible <strong>"Get
            Help"</strong> section listing reliable hotlines or organizations that offer assistance. This
            could include the phone numbers of local immigration legal aid nonprofits, the Immigration Legal
            Resource Center hotline, or national networks that help detainees. The ACLU's KYR page, for
            example, refers readers to contact their <em>local ACLU affiliate</em> and lists other groups
            like the National Immigration Law Center and AILA for more info. You might create a page or
            sidebar with "Important Contacts" that has a national deportation defense hotline, regional rapid
            response networks, and links to <strong>find legal help</strong>. Make sure this info is kept
            up-to-date.
          </li>
          
          <li>
            <strong>Additional Resources and Legal References:</strong> It's good to include links or
            downloadable resources for those who want to dive deeper. For example, link to official
            <strong>ICE or DHS memos</strong> on sensitive locations, or to know-your-rights <strong>flyers
            in PDF</strong> that users can print and share. Many sites have a section for "More Resources"
            or "Learn More", which might link out to partner organizations' toolkits or multi-language
            brochures. If possible, also have a section for <strong>"Know Your Rights in Other Languages"</strong>,
            linking to the same content or summaries in Spanish, Chinese, Arabic, etc. (The ACLU's pages list
            other languages and provide translations of the KYR content in those languages.)
          </li>
          
          <li>
            <strong>Disclaimers and Legal Info:</strong> Don't forget to mention that the information is
            <em>general and not legal advice</em> for specific cases. This can be a footer note on every page.
            If your site is providing information that might evolve (due to law changes), note the
            <strong>last updated date</strong> on each page so users know if it's current. For example, laws
            and policies around immigration enforcement change, so time-stamping content (and updating it
            regularly) is important.
          </li>
        </ul>

        <p>
          By covering these sections, your site will be comprehensive. Essentially, the content should equip
          users with knowledge of their rights, a plan of action for various encounters, and resources to get
          further help. Organize the content with logical headings and perhaps a sidebar or menu listing all
          these sections for quick access. Many successful KYR guides use FAQs or Q&A format under each section,
          which can be a reader-friendly way to present the info (e.g., Q: "Can ICE enter my home without a
          warrant?" A: "No, unless you consent or they have a judicial warrant. Here's how to verify a
          warrant…"). Use whatever format makes the information <strong>clear, concise, and actionable</strong>.
        </p>
      </ContentSection>

      <ContentSection id="tech-stack" title="Tech Stack Suggestions (Static-Site Generators and More)" level={2}>
        <p>
          When building an informational site for an advocacy or nonprofit context, you'll likely want a
          solution that is <strong>easy to maintain, inexpensive to host, and secure</strong>. Static-site
          generators (SSGs) are often a great fit because they produce fast, secure websites with minimal
          server requirements. Here are some tech stack considerations, including modern SSG frameworks:
        </p>

        <ul>
          <li>
            <strong>SvelteKit:</strong> SvelteKit is a framework built on Svelte, known for highly efficient
            client-side performance. It can generate a static site or run in server-rendered mode, giving
            flexibility for future needs. One advantage of SvelteKit is that it bridges the gap between a
            simple static site and a full web application: you can start with mostly static content, but also
            incorporate interactive components if needed (for example, a quiz, a state-specific lookup tool,
            or a chat widget) without changing frameworks. SvelteKit's fast build times and automatic
            code-splitting mean you get good performance out of the box. If your team enjoys Svelte's
            developer experience, SvelteKit would allow you to create a rich UI (transitions, modals, etc.)
            while still outputting static pages that can be deployed on a CDN. (Notably, SvelteKit is actively
            improving i18n and other features important for content sites.)
          </li>
          
          <li>
            <strong>Astro:</strong> Astro is another popular choice, especially for <strong>content-rich
            sites</strong>. Astro is designed with the philosophy of shipping as little JavaScript to the
            client as necessary – using an <strong>"islands" architecture</strong> to hydrate only interactive
            parts. You can build the site using JSX, Svelte, or other component frameworks, but the end result
            can be mostly static HTML/CSS with near-zero JS for users to download. This leads to very fast
            load times and good SEO, which is great for a site that's essentially a repository of information.
            Astro supports Markdown and MDX content, making it convenient to author and update know-your-rights
            articles. It also has a growing ecosystem of integrations (for CMS, search, etc.) and supports
            pulling content from local files or a headless CMS. In short, <strong>Astro is ideal if your focus
            is on static content</strong> that should be lightweight and highly performant, and you don't need
            heavy client-side interactivity beyond maybe a contact form. (A rule of thumb: <em>"Astro is great
            for content-rich sites like blogs or documentation, while SvelteKit is great for dynamic, highly
            interactive web apps"</em>.)
          </li>
          
          <li>
            <strong>Other Static Site Generators:</strong> Traditional SSGs like <strong>Eleventy, Hugo, or
            Jekyll</strong> are also solid choices, particularly if your team is more comfortable with
            template-driven site generation. For instance, Eleventy (11ty) is known for its simplicity and
            flexibility – allowing you to focus on writing content and not on the framework itself. These
            tools might require less JavaScript knowledge and can be easier for non-developers to pick up for
            basic edits (Eleventy can use plain HTML or Markdown templates). However, they may lack some of
            the out-of-the-box interactivity that frameworks like SvelteKit provide. If your site is
            relatively straightforward (mostly text and images, with maybe some embedded videos), an SSG like
            Eleventy or Hugo would work well and result in a no-frills, fast site.
          </li>
          
          <li>
            <strong>Hosting and Deployment:</strong> With any of these SSG approaches, you can host the site
            easily on static hosting services like <strong>Netlify, Vercel, GitHub Pages, or Cloudflare
            Pages</strong>. These services often have free tiers for open-source or nonprofit projects and
            provide automatic CI/CD – so when you update content in your repository, the site rebuilds and
            deploys. If using SvelteKit with SSR, you might deploy on a platform like Vercel or Node-based
            server, but for a KYR site it's preferable to pre-render everything statically for simplicity and
            low cost.
          </li>
          
          <li>
            <strong>Search and Navigation:</strong> Consider how users will search the content. If the site
            grows large, implementing a client-side search bar could be helpful (there are search libraries
            that work with static sites, or services like Algolia DocSearch for open source projects). Ensure
            the framework you choose can accommodate adding a search feature. Both Astro and SvelteKit can
            integrate search scripts or React/Vue components if needed. Also ensure good navigation design –
            possibly breadcrumbs or a sticky sidebar with section links – so users can easily jump between
            sections of the guide.
          </li>
          
          <li>
            <strong>Analytics and Privacy:</strong> Given the sensitive nature of the topic (users might be
            wary of being tracked on a site about immigrant rights), you might choose a privacy-respecting
            analytics tool (like Plausible or Matomo) or forego analytics altogether. Technically, any of
            these stacks can include an analytics script, but be mindful of user trust and possibly include
            a privacy notice if you collect any data.
          </li>
        </ul>

        <p>
          In summary, a <strong>static site approach</strong> is recommended for a Know-Your-Rights site:
          it's secure (no server databases to hack), fast (which is good for users on mobile phones in the
          field), and low-maintenance for a small team. SvelteKit and Astro are modern tools that can give
          you a lot of power and flexibility, while older generators like Eleventy are minimalist but reliable.
          Choose based on your team's familiarity and the site's needs for interactivity. Importantly, make
          sure your stack supports <strong>multilingual content</strong> and <strong>accessible design</strong>
          (for example, can you easily manage multiple language versions, and add proper attributes for screen
          readers? More on that next).
        </p>
      </ContentSection>

      <ContentSection id="multilingual" title="Multilingual Support and Trusted Translation Workflow" level={2}>
        <p>
          Immigrant-focused resources must often be multilingual. It's common to provide content at least in
          <strong>English and Spanish</strong>, and often in other languages prevalent in the community
          (Chinese, Arabic, French, Tagalog, Vietnamese, etc., depending on your audience). Here are best
          practices for handling multilingual support:
        </p>

        <ul>
          <li>
            <strong>Plan Your Localization Strategy:</strong> Decide early whether you will use a subdirectory
            for each language (e.g., `yourrights.org/en/...` and `yourrights.org/es/...`), subdomains
            (`es.yourrights.org`), or a separate domain (as Informed Immigrant does with inmigranteinformado.com
            for Spanish). Subdirectories are often simplest for SEO and navigation. SSG frameworks like Astro
            or SvelteKit can support generating pages for each language version. For example, you might keep
            content in markdown files with language codes or use an i18n library. (The SvelteKit team has
            recognized the need for better i18n support and has improvements on the roadmap.) Whichever
            approach, ensure that each page clearly indicates its language (using the HTML lang attribute like
            <code>&lt;html lang="es"&gt;</code> for instance) for accessibility and search engines.
          </li>
          
          <li>
            <strong>User-Friendly Language Switching:</strong> Provide an obvious way for users to switch
            languages on the site. This could be a menu in the header that says "English | Español | Français
            | …" in each respective language (avoid using flags as the only indicator; text is clearer). The
            switch should take the user to the equivalent page in the other language if available. For example,
            the ACLU KYR page has an "Español" link that takes you to the Spanish version of that same guide.
            Ensure this toggle is accessible (screen readers should announce it properly, e.g. "Spanish
            language"). Also, design the site so that if a translation isn't available for a certain page,
            the user is informed or redirected gracefully.
          </li>
          
          <li>
            <strong>Quality Translation Workflow:</strong> Because legal rights content must be precise, it's
            important to use <strong>trusted human translators</strong> rather than machine translation.
            Partner with bilingual experts or community organizations to translate the materials. For instance,
            the ILRC credits its many partners for contributing translations of the Red Cards into various
            languages – a model where community involvement ensures accuracy and cultural appropriateness.
            Establish a workflow where whenever the English content is updated, translators are notified to
            update the other language versions. Using a translation management tool or even a shared
            spreadsheet can help track changes. It's also wise to have a second native speaker review each
            translation (especially for legal nuances). Remember that colloquial tone might need adjusting in
            different languages to maintain clarity and respect. If possible, provide contact info for users
            to <strong>report translation issues</strong> – community feedback can catch errors or suggest
            improvements.
          </li>
          
          <li>
            <strong>Maintain Consistency Across Languages:</strong> Strive to offer the <strong>same
            content</strong> in each supported language so that no group gets outdated or less information.
            This can be challenging, but it's important. If certain external resources aren't available in a
            given language, note that ("This resource is currently available in English only"). The "We Have
            Rights" campaign is a good example of parity – they produced the know-your-rights videos in 8
            languages including English, Spanish, Arabic, Mandarin, Russian, Haitian Creole, Urdu, and French,
            ensuring each language community had access to the full set of information. Similarly, IDP's
            flyers being in 17 languages shows a commitment to broad accessibility. On your site, list the
            languages available and consider a statement encouraging sharing of the info in those languages.
          </li>
          
          <li>
            <strong>Localization Beyond Translation:</strong> Remember that true localization might require
            adjusting examples or context for different communities. For instance, a reference to "911" or
            certain legal aid organizations in the English content might need explanation or different
            references in another language version. Work with community advisors to ensure the content is
            culturally relevant and the tone is appropriate (some languages may prefer a more formal address
            for authority, etc.). However, avoid deviating too much – the core legal advice should remain
            consistent across languages.
          </li>
          
          <li>
            <strong>Testing with Native Speakers:</strong> Before launch, have native speakers (ideally,
            non-technical folks from the community) navigate the site in their language. They can ensure the
            text reads naturally, the fonts support the script (e.g. Arabic or Chinese characters render
            correctly), and that the navigation makes sense. They might also test using input methods for
            those languages on search bars or forms. This user testing can reveal, say, if Spanish text is
            too verbose in a button or if a right-to-left language like Arabic displays correctly.
          </li>
        </ul>

        <p>
          Implementing multilingual support is definitely extra work, but it exponentially increases the
          impact of a know-your-rights site. Many in the target audience might be <em>more comfortable in a
          language other than English</em>, so providing that can make the difference between someone actually
          using the advice or not. As a positive example, by adding French to the "We Have Rights" videos, BDS
          addressed a need in French-speaking immigrant communities. Similarly, your site should evolve to meet
          the language needs of its users. Lastly, make sure any downloadable PDFs or resources linked on your
          site also have translated versions (and label them clearly, e.g. "Know Your Rights Flyer – Arabic").
          Consistency and clarity in language offerings build trust with your users.
        </p>
      </ContentSection>

      <ContentSection id="open-licensing" title="Open Licensing and Content Sharing" level={2}>
        <p>
          Legal rights information is often more valuable the more it's shared. To encourage dissemination,
          consider publishing your original content under an <strong>open license</strong> such as Creative
          Commons. This allows other advocates, community groups, or individuals to reuse and distribute the
          material (with proper attribution) – getting the knowledge into more hands.
        </p>

        <ul>
          <li>
            <strong>Choose a Suitable Creative Commons License:</strong> A common choice is <strong>CC BY 4.0
            (Attribution)</strong>, which lets others copy, distribute, and remix your content as long as they
            credit your organization. This is a very permissive license that facilitates widespread sharing.
            For instance, the Electronic Frontier Foundation (EFF) uses CC BY 4.0 for all original content on
            their site, explicitly allowing free redistribution. Another option might be <strong>CC BY-NC</strong>
            (Attribution-NonCommercial) if you want to prevent commercial use of your materials (e.g., to stop
            someone from selling your KYR guide), though NonCommercial restrictions can complicate use for some
            legitimate groups. CC BY-SA (ShareAlike) ensures that any derivatives are shared under the same terms.
            Weigh these options and pick one that aligns with your goals – the simpler, the better (CC BY or
            CC BY-SA are often recommended for outreach content).
          </li>
          
          <li>
            <strong>Make the License Visible:</strong> Whichever license you choose, display it on your site
            (for example, in the footer or an "About this Site" page). A common practice is a line like
            "© 2025 [Your Org]. This content is licensed under CC BY 4.0" with a link to the CC deed. This
            signals to visitors and other organizations that they <em>are free to share</em> the information.
            Many nonprofits don't mind their KYR content being copied, but an explicit license removes ambiguity
            and legal hesitation for others who might want to print your guide for a workshop or include your
            text in their own materials.
          </li>
          
          <li>
            <strong>Leverage Existing Open Content:</strong> Open licensing is a two-way street – you can also
            incorporate or adapt content from other openly licensed guides, with attribution. There's no need
            to reinvent the wheel if, say, a partner org has a section well-written on "What to do if ICE knocks
            on your door." If their content is open (or if you obtain permission), you can merge it into your
            site, translating or tweaking as needed, which accelerates your development. Just ensure you credit
            the source per the license requirements (e.g., a footnote or caption citing the original).
          </li>
          
          <li>
            <strong>Copyright and Trademark Considerations:</strong> If you use any images or graphics, make
            sure you have rights to use them or they are your own. For any original graphics you create (like
            infographics or icons for rights information), consider also licensing those under CC so others can
            embed them. The goal is to reduce barriers for community educators to use your site's content in
            trainings or printouts. Open licensing is about granting permission in advance. As EFF notes, you
            shouldn't have to ask permission to reprint their content – it's granted by the license. Embracing
            this philosophy can significantly increase the reach of your Know-Your-Rights message.
          </li>
          
          <li>
            <strong>Attribution Practices:</strong> Encourage those who reuse your content to cite back to your
            website (which can also drive traffic). This can be as simple as adding a line "Source: [Your Org]
            Know Your Rights guide" on reprints. If you have a PDF download, you might put the CC license and
            attribution suggestion on the PDF itself, since once it's downloaded it may be shared independently
            of the site.
          </li>
        </ul>

        <p>
          Open licensing your legal rights content under a framework like Creative Commons aligns with the
          mission of empowerment – it allows anyone who needs the material to propagate it freely. As long as
          your organization is comfortable with others using your work (with credit given), it can only help
          more people learn about their rights. In the spirit of community and open justice, it's a strong
          recommended practice. (Do note: if some content on your site is sourced from elsewhere and not
          originally by you, you'll need to mark that and not license it under CC without permission. For
          example, if you include an ICE pamphlet or a third-party video, those might be All Rights Reserved –
          clarify which parts are openly licensed.)
        </p>
      </ContentSection>

      <ContentSection id="conclusion" title="Conclusion" level={2}>
        <p>
          Building a "Know Your Rights" website for immigration scenarios involves a blend of good design,
          reliable content, technical soundness, and community focus. By studying successful examples (like
          ACLU, BDS's We Have Rights, Informed Immigrant, IDP, and ILRC resources), you can emulate what
          works: clear layout, accessible content, multilingual reach, and practical guidance. Always keep
          the end-user in mind – someone who might be in a stressful situation looking for quick answers –
          and optimize the site for simplicity and speed (mobile-first design is key, since many will access
          on a phone). Follow accessibility and internationalization best practices to ensure no one is left
          out, and consider open licensing to maximize impact. With these best practices, your know-your-rights
          site can become an invaluable tool for immigrant communities, equipping them with knowledge to
          confidently assert their rights and find help when needed.
        </p>
      </ContentSection>

      <ContentSection id="sources" title="Sources and Examples" level={2}>
        <ul>
          <li>
            ACLU – <em>"Immigrants' Rights – Know Your Rights"</em> (scenario-based guides, multi-language)
          </li>
          <li>
            Brooklyn Defender Services/ACLU – <em>"We Have Rights"</em> campaign (animated rights videos in 8 languages)
          </li>
          <li>
            Informed Immigrant – <em>Know Your Rights Guide</em> (comprehensive multi-section guide with Spanish mirror site)
          </li>
          <li>
            Immigrant Defense Project – <em>Know Your Rights with ICE</em> (infographics, flyers in 17 languages)
          </li>
          <li>
            Immigrant Legal Resource Center – <em>Red Cards (Tarjetas Rojas)</em> (wallet-sized rights cards in many languages)
          </li>
          <li>
            Morweb on Nonprofit Accessibility – (summary of WCAG 2.1 AA best practices)
          </li>
          <li>
            CloudCannon (2025) – <em>Top Static Site Generators</em> (discussion of Astro and SvelteKit benefits)
          </li>
          <li>
            EFF – <em>Copyright Policy</em> (example of CC BY 4.0 open licensing for rights content)
          </li>
        </ul>
      </ContentSection>
    </main>
  </div>
</div>

<style>
  .guide-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .guide-header {
    margin-bottom: 2rem;
    text-align: center;
  }

  .guide-header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .guide-subtitle {
    font-size: 1.25rem;
    color: #666;
    margin-bottom: 1.5rem;
  }

  .back-link {
    display: inline-block;
    color: #0066cc;
    text-decoration: none;
    margin-top: 1rem;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  .guide-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
  }

  .toc-container {
    position: relative;
  }

  .main-content {
    min-width: 0;
  }

  /* Responsive adjustments */
  @media (max-width: 1024px) {
    .guide-content {
      grid-template-columns: 250px 1fr;
      gap: 1.5rem;
    }
  }

  @media (max-width: 768px) {
    .guide-content {
      grid-template-columns: 1fr;
    }

    .toc-container {
      order: 1;
      margin-bottom: 2rem;
    }

    .main-content {
      order: 2;
    }
  }
</style>
