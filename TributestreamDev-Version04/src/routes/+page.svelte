<script lang="ts">
// State management for the SPA
let currentSection = $state("home");
let currentLanguage = $state("en");
let currentScenario = $state("");

// Language options
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "zh", name: "中文" },
  { code: "ar", name: "العربية" },
  { code: "fr", name: "Français" }
];

// Rights scenarios
const scenarios = [
  { 
    id: "home",
    title: { en: "Rights at Home", es: "Derechos en Casa", zh: "家中权利", ar: "الحقوق في المنزل", fr: "Droits à Domicile" },
    content: { 
      en: "If ICE comes to your door: Do not open the door. Ask to see a warrant. The warrant must be signed by a judge and have your correct name and address.",
      es: "Si ICE llega a su puerta: No abra la puerta. Pida ver una orden judicial. La orden debe estar firmada por un juez y tener su nombre y dirección correctos.",
      zh: "如果ICE来到您的门前：不要开门。要求查看搜查令。搜查令必须由法官签署，并有您正确的姓名和地址。",
      ar: "إذا جاء ICE إلى بابك: لا تفتح الباب. اطلب رؤية أمر تفتيش. يجب أن يكون أمر التفتيش موقعًا من قاضٍ ويحتوي على اسمك وعنوانك الصحيحين.",
      fr: "Si ICE vient à votre porte : N'ouvrez pas la porte. Demandez à voir un mandat. Le mandat doit être signé par un juge et comporter votre nom et adresse corrects."
    }
  },
  { 
    id: "public",
    title: { en: "Rights in Public", es: "Derechos en Público", zh: "公共场所权利", ar: "الحقوق في الأماكن العامة", fr: "Droits en Public" },
    content: { 
      en: "If stopped by law enforcement: Stay calm. Give your name if asked. You have the right to remain silent. Say 'I want to remain silent.'",
      es: "Si es detenido por la policía: Mantenga la calma. Dé su nombre si se lo piden. Tiene derecho a guardar silencio. Diga 'Quiero mantenerme en silencio.'",
      zh: "如果被执法人员拦截：保持冷静。如果被问到，请提供您的姓名。您有权保持沉默。说'我要保持沉默。'",
      ar: "إذا أوقفتك الشرطة: ابق هادئًا. أعط اسمك إذا طُلب منك ذلك. لديك الحق في التزام الصمت. قل 'أريد البقاء صامتًا.'",
      fr: "Si vous êtes arrêté par les forces de l'ordre : Restez calme. Donnez votre nom si on vous le demande. Vous avez le droit de garder le silence. Dites 'Je souhaite garder le silence.'"
    }
  },
  { 
    id: "traffic",
    title: { en: "Traffic Stops", es: "Paradas de Tráfico", zh: "交通拦截", ar: "توقف حركة المرور", fr: "Contrôles Routiers" },
    content: { 
      en: "If pulled over while driving: Stop in a safe place. Keep hands visible on the steering wheel. If asked, provide license, registration, and insurance.",
      es: "Si lo detienen mientras conduce: Deténgase en un lugar seguro. Mantenga las manos visibles en el volante. Si se lo piden, proporcione licencia, registro y seguro.",
      zh: "如果在驾驶时被拦下：在安全的地方停车。将手放在方向盘上保持可见。如果被要求，请提供驾照、车辆登记证和保险证明。",
      ar: "إذا تم إيقافك أثناء القيادة: توقف في مكان آمن. أبقِ يديك مرئية على عجلة القيادة. إذا طُلب منك، قدم الرخصة والتسجيل والتأمين.",
      fr: "Si vous êtes arrêté en conduisant : Arrêtez-vous dans un endroit sûr. Gardez les mains visibles sur le volant. Si on vous le demande, fournissez permis, carte grise et assurance."
    }
  }
];

// Resources
const resources = {
  emergency: {
    title: { en: "Emergency Planning", es: "Plan de Emergencia", zh: "应急计划", ar: "التخطيط للطوارئ", fr: "Plan d'Urgence" },
    content: { 
      en: "Create an emergency plan: 1) Designate trusted individuals to care for your children if you're detained. 2) Prepare a file with important documents.",
      es: "Cree un plan de emergencia: 1) Designe personas de confianza para cuidar a sus hijos si es detenido. 2) Prepare un archivo con documentos importantes.",
      zh: "制定应急计划：1）指定可信任的人在您被拘留时照顾您的孩子。2）准备一个包含重要文件的文件夹。",
      ar: "قم بإنشاء خطة طوارئ: 1) عيّن أشخاصًا موثوقين لرعاية أطفالك إذا تم احتجازك. 2) قم بإعداد ملف بالوثائق المهمة.",
      fr: "Créez un plan d'urgence : 1) Désignez des personnes de confiance pour s'occuper de vos enfants si vous êtes détenu. 2) Préparez un dossier avec des documents importants."
    }
  },
  legal: {
    title: { en: "Legal Resources", es: "Recursos Legales", zh: "法律资源", ar: "الموارد القانونية", fr: "Ressources Juridiques" },
    content: { 
      en: "National Immigration Legal Services Directory: 1-800-375-5283\nACLU Immigrants' Rights: 1-212-549-2500",
      es: "Directorio Nacional de Servicios Legales de Inmigración: 1-800-375-5283\nDerechos de Inmigrantes de ACLU: 1-212-549-2500",
      zh: "国家移民法律服务目录：1-800-375-5283\nACLU移民权利：1-212-549-2500",
      ar: "دليل خدمات الهجرة القانونية الوطنية: 1-800-375-5283\nحقوق المهاجرين ACLU: 1-212-549-2500",
      fr: "Répertoire national des services juridiques d'immigration : 1-800-375-5283\nDroits des immigrants ACLU : 1-212-549-2500"
    }
  }
};

// Navigation handler
function navigateTo(section: string, scenario: string = "") {
  currentSection = section;
  currentScenario = scenario;
  window.scrollTo(0, 0);
}

// Get translated content based on current language
function getTranslation(content: Record<string, string>): string {
  return content[currentLanguage] || content.en;
}

// Direction for RTL support
let documentDirection = $derived(currentLanguage === 'ar' ? 'rtl' : 'ltr' as const);
</script>

<svelte:head>
  <title>Know Your Rights</title>
</svelte:head>

<div class="app" dir={documentDirection as "rtl" | "ltr"}>
  <!-- Header with language selector -->
  <header>
    <div class="logo" on:click={() => navigateTo('home')}>
      <h1>Know Your Rights</h1>
    </div>
    
    <div class="language-selector">
      {#each languages as lang}
        <button 
          class:active={currentLanguage === lang.code} 
          on:click={() => currentLanguage = lang.code}
        >
          {lang.name}
        </button>
      {/each}
    </div>
  </header>

  <!-- Emergency hotline banner -->
  <div class="emergency-banner">
    <strong>{getTranslation({
      en: "Emergency Hotline:",
      es: "Línea de Emergencia:",
      zh: "紧急热线：",
      ar: "خط الطوارئ:",
      fr: "Ligne d'Urgence:"
    })}</strong> 1-800-898-7180
  </div>

  <div class="guide-link-banner">
    <a href="/know-your-rights-guide" class="guide-link">
      {getTranslation({
        en: "View Comprehensive Guide on Building a Know Your Rights Website",
        es: "Ver Guía Completa sobre Cómo Construir un Sitio Web de Conozca Sus Derechos",
        zh: "查看关于构建「了解您的权利」网站的综合指南",
        ar: "عرض الدليل الشامل حول بناء موقع اعرف حقوقك",
        fr: "Voir le Guide Complet sur la Construction d'un Site Web Connaître Vos Droits"
      })}
    </a>
  </div>

  <!-- Main content area -->
  <main>
    {#if currentSection === 'home'}
      <!-- Home page -->
      <section class="home">
        <h2>{getTranslation({
          en: "Know and assert your constitutional rights",
          es: "Conozca y haga valer sus derechos constitucionales",
          zh: "了解并维护您的宪法权利",
          ar: "اعرف وأكد حقوقك الدستورية",
          fr: "Connaître et faire valoir vos droits constitutionnels"
        })}</h2>
        
        <div class="quick-access">
          {#each scenarios as scenario}
            <div class="card" on:click={() => navigateTo('scenarios', scenario.id)}>
              <h3>{getTranslation(scenario.title)}</h3>
            </div>
          {/each}
          
          <div class="card" on:click={() => navigateTo('emergency')}>
            <h3>{getTranslation(resources.emergency.title)}</h3>
          </div>
          
          <div class="card" on:click={() => navigateTo('legal')}>
            <h3>{getTranslation(resources.legal.title)}</h3>
          </div>
        </div>
      </section>
    
    {:else if currentSection === 'scenarios'}
      <!-- Scenario detail page -->
      <section class="scenario-detail">
        <a href="#home" class="back-link" on:click|preventDefault={() => navigateTo('home')}>
          &larr; {getTranslation({
            en: "Back to Home",
            es: "Volver al Inicio",
            zh: "返回首页",
            ar: "العودة إلى الصفحة الرئيسية",
            fr: "Retour à l'Accueil"
          })}
        </a>
        
        {#each scenarios as scenario}
          {#if scenario.id === currentScenario}
            <h2>{getTranslation(scenario.title)}</h2>
            <p>{getTranslation(scenario.content)}</p>
            
            <div class="action-steps">
              <h3>{getTranslation({
                en: "What to Do",
                es: "Qué Hacer",
                zh: "该怎么做",
                ar: "ماذا تفعل",
                fr: "Que Faire"
              })}</h3>
              
              <div class="step">
                <strong>1.</strong> {getTranslation({
                  en: "Stay calm and collected.",
                  es: "Manténgase tranquilo y sereno.",
                  zh: "保持冷静和镇定。",
                  ar: "ابق هادئًا ومتماسكًا.",
                  fr: "Restez calme et posé."
                })}
              </div>
              
              <div class="step">
                <strong>2.</strong> {getTranslation({
                  en: "Assert your rights clearly.",
                  es: "Haga valer sus derechos claramente.",
                  zh: "清楚地维护您的权利。",
                  ar: "أكد حقوقك بوضوح.",
                  fr: "Affirmez clairement vos droits."
                })}
              </div>
              
              <button class="print-button">
                {getTranslation({
                  en: "Print Rights Card",
                  es: "Imprimir Tarjeta de Derechos",
                  zh: "打印权利卡",
                  ar: "طباعة بطاقة الحقوق",
                  fr: "Imprimer Carte de Droits"
                })}
              </button>
            </div>
            
            <div class="other-scenarios">
              <h3>{getTranslation({
                en: "Other Scenarios",
                es: "Otros Escenarios",
                zh: "其他场景",
                ar: "سيناريوهات أخرى",
                fr: "Autres Scénarios"
              })}</h3>
              
              {#each scenarios as otherScenario}
                {#if otherScenario.id !== currentScenario}
                  <a 
                    href="#{otherScenario.id}" 
                    on:click|preventDefault={() => navigateTo('scenarios', otherScenario.id)}
                  >
                    {getTranslation(otherScenario.title)}
                  </a>
                {/if}
              {/each}
            </div>
          {/if}
        {/each}
      </section>
    
    {:else if currentSection === 'emergency'}
      <!-- Emergency planning page -->
      <section class="emergency">
        <a href="#home" class="back-link" on:click|preventDefault={() => navigateTo('home')}>
          &larr; {getTranslation({
            en: "Back to Home",
            es: "Volver al Inicio",
            zh: "返回首页",
            ar: "العودة إلى الصفحة الرئيسية",
            fr: "Retour à l'Accueil"
          })}
        </a>
        
        <h2>{getTranslation(resources.emergency.title)}</h2>
        <p>{getTranslation(resources.emergency.content)}</p>
        
        <button class="download-button">
          {getTranslation({
            en: "Download Emergency Plan Template",
            es: "Descargar Plantilla de Plan de Emergencia",
            zh: "下载应急计划模板",
            ar: "تنزيل نموذج خطة الطوارئ",
            fr: "Télécharger le Modèle de Plan d'Urgence"
          })}
        </button>
      </section>
    
    {:else if currentSection === 'legal'}
      <!-- Legal resources page -->
      <section class="legal">
        <a href="#home" class="back-link" on:click|preventDefault={() => navigateTo('home')}>
          &larr; {getTranslation({
            en: "Back to Home",
            es: "Volver al Inicio",
            zh: "返回首页",
            ar: "العودة إلى الصفحة الرئيسية",
            fr: "Retour à l'Accueil"
          })}
        </a>
        
        <h2>{getTranslation(resources.legal.title)}</h2>
        <pre>{getTranslation(resources.legal.content)}</pre>
        
        <button class="download-button">
          {getTranslation({
            en: "Download Rights Cards",
            es: "Descargar Tarjetas de Derechos",
            zh: "下载权利卡",
            ar: "تنزيل بطاقات الحقوق",
            fr: "Télécharger les Cartes de Droits"
          })}
        </button>
      </section>
    {/if}
  </main>
</div>

<style>
  /* Basic styling */
  :global(body) {
    font-family: system-ui, -apple-system, sans-serif;
    margin: 0;
    padding: 0;
    line-height: 1.5;
  }
  
  .app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .logo {
    cursor: pointer;
  }
  
  .language-selector {
    display: flex;
    gap: 0.5rem;
  }
  
  .language-selector button {
    padding: 0.5rem;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
  }
  
  .language-selector button.active {
    background: #0066cc;
    color: white;
  }
  
  .emergency-banner {
    background: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    margin: 1rem 0;
    border-radius: 4px;
    text-align: center;
  }
  
  .guide-link-banner {
    background: #e2f0fd;
    padding: 0.75rem;
    margin: 1rem 0;
    border-radius: 4px;
    text-align: center;
  }
  
  .guide-link {
    color: #0066cc;
    text-decoration: none;
    font-weight: 500;
  }
  
  .guide-link:hover {
    text-decoration: underline;
  }
  
  main {
    padding: 1rem 0;
  }
  
  .quick-access {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }
  
  .card {
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  .back-link {
    display: inline-block;
    margin-bottom: 1rem;
    color: #0066cc;
    text-decoration: none;
  }
  
  .action-steps {
    margin: 2rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 4px;
  }
  
  .step {
    margin-bottom: 1rem;
  }
  
  .other-scenarios {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .print-button, .download-button {
    padding: 0.75rem 1.5rem;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }
  
  /* RTL support */
  [dir="rtl"] .back-link:before {
    content: "\2192";
    margin-right: 0.5rem;
  }
</style>
