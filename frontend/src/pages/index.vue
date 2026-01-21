<template>
  <div class="landing-page">
    <!-- 1. Header -->
    <header class="header">
      <div class="container header-content">
        <div class="logo">
          <span class="logo-icon">⚙️</span>
          <div class="logo-text">
            <span class="brand">ENGINY</span>
            <span class="sub-brand">Consorci d'Educació de Barcelona</span>
          </div>
        </div>
        <nav class="nav-links">
          <a href="#hero">Inici</a>
          <a href="#modalitats">Catàleg</a>
          <a href="#gestio">Rols</a>
          <a href="#suport">Suport</a>
        </nav>
        <NuxtLink to="/login" class="btn-login-header">
          Accedir a la Intranet <span class="lock-icon">🔒</span>
        </NuxtLink>
      </div>
    </header>

    <!-- 2. Hero Section -->
    <section id="hero" class="hero-section">
      <div class="container hero-content">
        <h1 class="hero-title animate-scroll pop-in">
          La logística d'ENGINY,<br />
          ara <span class="highlight">100% digital</span>.
        </h1>
        <p class="hero-subtitle animate-scroll delay-100">
          Gestiona inscripcions, assignacions i seguiment dels tallers orientadors 
          per a alumnat d'ESO d'una manera centralitzada i eficient.
          <br /><br />
          <em>"Adéu al paper, hola a l'eficiència."</em>
        </p>
        <div class="hero-actions animate-scroll delay-200">
          <NuxtLink to="/register?role=centre" class="btn-primary">
            Sóc un Centre
          </NuxtLink>
          <NuxtLink to="/register?role=professor" class="btn-secondary">
            Sóc Professor Referent
          </NuxtLink>
        </div>
      </div>
      <!-- Decorative Background Elements -->
      <div class="hero-bg-shape"></div>
    </section>

    <!-- 3. Modalitats Section -->
    <section id="modalitats" class="section modalitats-section">
      <div class="container">
        <h2 class="section-title animate-scroll">Les 3 Modalitats d'Aprenentatge</h2>
        <div class="grid-3">
          <div class="card animate-scroll slide-left delay-100">
            <div class="card-icon">🏢</div>
            <h3>Fora del centre</h3>
            <p>Entorns semiprofessionals amb alumnat de diversos centres.</p>
            <span class="badge">20h trimestrals</span>
          </div>
          <div class="card animate-scroll delay-200">
            <div class="card-icon">🏫</div>
            <h3>Dins del centre</h3>
            <p>Experts que venen al teu institut per treballar amb l'alumnat.</p>
            <span class="badge">20h trimestrals</span>
          </div>
          <div class="card animate-scroll slide-right delay-300">
            <div class="card-icon">🤝</div>
            <h3>Ofici Compartit</h3>
            <p>Projectes en entorns externs per explorar sectors reals.</p>
            <span class="badge">30h trimestrals (Dijous)</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Àrees de Gestió Section -->
    <section id="gestio" class="section areas-section">
      <div class="container">
        <h2 class="section-title animate-scroll">Àrees de Gestió</h2>
        <p class="section-desc animate-scroll">Una plataforma per a tothom</p>
        <div class="grid-3">
          <div class="feature-block center-role animate-scroll pop-in delay-100">
            <div class="role-icon">🏫</div>
            <h3>Per a Centres</h3>
            <ul>
              <li>Inscripció trimestral simplificada.</li>
              <li>Pujada de documentació (IDALU, Acords).</li>
              <li>Checklist final de validació.</li>
            </ul>
          </div>
          <div class="feature-block admin-role animate-scroll pop-in delay-200">
            <div class="role-icon">📊</div>
            <h3>Per a Administració (CEB)</h3>
            <ul>
              <li>Motor d'assignació intel·ligent.</li>
              <li>Control total del catàleg i sectors.</li>
              <li>Dashboards i informes en temps real.</li>
            </ul>
          </div>
          <div class="feature-block teacher-role animate-scroll pop-in delay-300">
            <div class="role-icon">👨‍🏫</div>
            <h3>Per a Professors</h3>
            <ul>
              <li>Consulta ràpida de tallers assignats.</li>
              <li>Llistats d'assistència digitals.</li>
              <li>Notificacions de canvis.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Workflow Section -->
    <section class="section workflow-section">
      <div class="container">
        <h2 class="section-title animate-scroll">Digitalització i Flux de Treball</h2>
        <div class="steps-container">
          <div class="step animate-scroll slide-left delay-100">
            <div class="step-circle">1</div>
            <h4>Explora</h4>
            <p>Consulta els 11 sectors professionalitzadors.</p>
          </div>
          <div class="step-connector"></div>
          <div class="step animate-scroll slide-left delay-200">
            <div class="step-circle">2</div>
            <h4>Sol·licita</h4>
            <p>Tria fins a 4 alumnes per projecte.</p>
          </div>
          <div class="step-connector"></div>
          <div class="step animate-scroll slide-right delay-200">
            <div class="step-circle">3</div>
            <h4>Valida</h4>
            <p>Puja els documents i completa el checklist.</p>
          </div>
          <div class="step-connector"></div>
          <div class="step animate-scroll slide-right delay-100">
            <div class="step-circle">4</div>
            <h4>Avalua</h4>
            <p>Envia enquestes de satisfacció automàtiques.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Footer -->
    <footer id="suport" class="footer">
      <div class="container footer-content">
        <div class="footer-col">
          <strong>Contacte</strong>
          <p>Suport tècnic CEB | <a href="mailto:suport@ceb.cat">suport@ceb.cat</a></p>
        </div>
        <div class="footer-col">
          <strong>Legal</strong>
          <p>Avís legal | Privacitat (RGPD) | Política de Cookies</p>
        </div>
        <div class="footer-col">
          <strong>Tech Stack</strong>
          <p class="tech-stack">Powered by Nuxt & Express 🚀</p>
        </div>
      </div>
      <div class="footer-bottom">
        &copy; {{ new Date().getFullYear() }} Consorci d'Educació de Barcelona
      </div>
    </footer>
  </div>


</template>

<script setup>
import { onMounted } from 'vue'

definePageMeta({
  layout: 'landing'
})

// "Mes loco" Scroll Animation Logic
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
      }
    })
  }, {
    threshold: 0.1, // Trigger when 10% is visible
    rootMargin: '0px 0px -50px 0px'
  })

  // Select all elements we want to animate
  const hiddenElements = document.querySelectorAll('.animate-scroll')
  hiddenElements.forEach((el) => observer.observe(el))
})
</script>

<style scoped>
/* 
  Modern CSS Variables & Reset 
*/
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

/* --- KEYFRAMES --- */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

/* --- SCROLL ANIMATION CLASSES --- */
.animate-scroll {
  opacity: 0;
  transform: translateY(50px) scale(0.95);
  transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), 
              transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: opacity, transform;
}

.animate-scroll.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Delays for staggered effect */
.delay-100.is-visible { transition-delay: 0.1s; }
.delay-200.is-visible { transition-delay: 0.2s; }
.delay-300.is-visible { transition-delay: 0.3s; }

/* Specific "Loco" effects */
.pop-in {
  transform: scale(0.5);
}
.pop-in.is-visible {
  transform: scale(1);
}

.slide-left {
  transform: translateX(-100px);
}
.slide-left.is-visible {
  transform: translateX(0);
}

.slide-right {
  transform: translateX(100px);
}
.slide-right.is-visible {
  transform: translateX(0);
}


/* --- PAGE STYLES --- */
.landing-page {
  font-family: 'Inter', sans-serif;
  color: #333;
  line-height: 1.6;
  background-color: #f8f9fa;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.highlight {
  color: #0056b3;
  position: relative;
  display: inline-block;
}

/* Header */
.header {
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  animation: fadeInUp 0.8s ease-out;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.8rem;
  animation: float 3s ease-in-out infinite;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0056b3;
}

.sub-brand {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
}

.nav-links {
  display: none;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
    gap: 2rem;
    font-weight: 500;
  }
}

.btn-login-header {
  background-color: #0056b3;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: transform 0.2s;
}

.btn-login-header:hover {
  transform: translateY(-2px);
}

/* Hero Section */
.hero-section {
  padding: 6rem 0 4rem;
  background: linear-gradient(135deg, #e0f2ff 0%, #ffffff 100%);
  text-align: center;
  position: relative;
}

.hero-title {
  font-size: 3rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  font-weight: 800;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #555;
  max-width: 700px;
  margin: 0 auto 2.5rem auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary {
  background-color: #0056b3;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 86, 179, 0.3);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 86, 179, 0.5);
}

.btn-secondary {
  border: 2px solid #0056b3;
  color: #0056b3;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background-color: #e6f0ff;
  transform: translateY(-2px);
}

/* Sections */
.section {
  padding: 5rem 0;
}

.section-title {
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 3rem;
}

.grid-3 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Cards */
.card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border-top: 5px solid transparent;
  transition: all 0.3s;
  /* Start hidden for scroll anim */
}

.card:hover {
  transform: translateY(-15px) !important; /* Override scroll anim transform */
  border-top-color: #0056b3;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.badge {
  display: inline-block;
  background-color: #e6f0ff;
  color: #0056b3;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 1rem;
}

/* Features/Roles */
.feature-block {
  padding: 2rem;
  background-color: white;
  border-radius: 16px;
  border: 1px solid #eee;
  transition: all 0.3s;
}

.feature-block:hover {
  transform: scale(1.03) !important;
  border-color: #0056b3;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.feature-block ul {
  list-style: none;
  padding: 0;
}

.feature-block li {
  margin-bottom: 0.8rem;
  padding-left: 1.5rem;
  position: relative;
}

.feature-block li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #28a745;
  font-weight: bold;
}

/* Workflow */
.steps-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

@media (min-width: 768px) {
  .steps-container {
    flex-direction: row;
    align-items: flex-start;
  }
}

.step {
  text-align: center;
  flex: 1;
}

.step-circle {
  width: 60px;
  height: 60px;
  background-color: #0056b3;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto 1.5rem auto;
  box-shadow: 0 0 0 8px rgba(0, 86, 179, 0.1);
  transition: transform 0.3s;
}

.step:hover .step-circle {
  transform: rotate(10deg) scale(1.1);
  background-color: #004494;
}

/* Footer */
.footer {
  background-color: #1a202c;
  color: #cbd5e0;
  padding: 4rem 0 2rem 0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-bottom {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #2d3748;
}
</style>
