import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  BarChart3,
  Users,
  MapPin,
  Calendar,
  Shield,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Globe,
  Clock,
  Activity,
  ChevronDown
} from 'lucide-react';

const logoUrl = "/src/assets/Logo.png";

export function LandingPage({ onGetStarted }) {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={logoUrl}
                alt="VisiMap Logo"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = "w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg";
                  fallback.innerText = "V";
                  e.target.parentNode.prepend(fallback);
                }}
              />
              <div>
                <h2 className="text-xl">VisiMap</h2>
                <p className="text-xs text-gray-600">Museo MUVI</p>
              </div>
            </div>
            <Button onClick={onGetStarted} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Iniciar Sesión
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              Sistema de Gestión de Visitantes
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Digitaliza la experiencia del Museo MUVI
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              VisiMap transforma la gestión de visitantes con tecnología avanzada,
              análisis en tiempo real y una experiencia digital completa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8"
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => scrollToSection('museo')}
                variant="outline"
                size="lg"
                className="text-lg px-8"
              >
                Conocer Más
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sección de Museo MUVI */}

      <section id="museo" className="py-12 px-8 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl mb-6">
                Sobre el Museo MUVI
              </h2>
              <div className="space-y-4 text-gray-600 text-lg">
                <p>
                  El <strong>Museo Municipal de Villafranca de los Barros (MUVI)</strong> es un
                  espacio cultural dedicado a preservar y difundir el patrimonio histórico,
                  artístico y etnográfico de la región.
                </p>
                <p>
                  Con una rica colección que abarca desde la prehistoria hasta la época contemporánea,
                  el MUVI se ha consolidado como referente cultural en Extremadura, ofreciendo
                  exposiciones permanentes y temporales que conectan el pasado con el presente.
                </p>
                <p>
                  Ubicado en el corazón de Villafranca de los Barros, el museo recibe miles de
                  visitantes cada año, tanto locales como de otras regiones, convirtiéndose en
                  un punto de encuentro para la cultura y la educación.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl text-blue-600">+5K</p>
                  <p className="text-sm text-gray-600">Visitantes/año</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl text-purple-600">50+</p>
                  <p className="text-sm text-gray-600">Eventos</p>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                  <p className="text-2xl text-indigo-600">15+</p>
                  <p className="text-sm text-gray-600">Países</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="/src/assets/muvi1.jpeg"
                  alt="Museo Fachada"
                  className="rounded-lg shadow-lg col-span-2"
                />
                <img
                  src="/src/assets/muvihistoria.jpg"
                  className="rounded-lg shadow-lg"
                />
                <img
                  src="/src/assets/muvicoche.jpg"
                  alt="Visitantes"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Características app */}

      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl mb-4">
              Características de VisiMap
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Una plataforma completa diseñada para modernizar la gestión del museo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="w-12 h-12" />,
                title: 'Dashboard en Tiempo Real',
                description: 'Visualiza estadísticas y KPIs actualizados al instante con gráficas interactivas y métricas clave.',
                color: 'blue'
              },
              {
                icon: <MapPin className="w-12 h-12" />,
                title: 'Mapas Interactivos',
                description: 'Geolocalización de visitantes con Leaflet.js para análisis de origen geográfico detallado.',
                color: 'purple'
              },
              {
                icon: <Users className="w-12 h-12" />,
                title: 'Registro Digital',
                description: 'Captura rápida y eficiente de datos de visitantes con formularios intuitivos.',
                color: 'indigo'
              },
              {
                icon: <Calendar className="w-12 h-12" />,
                title: 'Gestión de Eventos',
                description: 'Calendario completo para planificar y gestionar exposiciones y actividades del museo.',
                color: 'pink'
              },
              {
                icon: <Shield className="w-12 h-12" />,
                title: 'Seguridad y Roles',
                description: 'Sistema robusto con autenticación y permisos diferenciados para administradores y trabajadores.',
                color: 'green'
              },
              {
                icon: <TrendingUp className="w-12 h-12" />,
                title: 'Análisis Avanzado',
                description: 'Informes detallados con Recharts para tomar decisiones basadas en datos reales.',
                color: 'orange'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4 text-${feature.color}-600`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios de la Digitalización */}

      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="/src/assets/Analisis.png"
                alt="Analytics"
                className="rounded-lg shadow-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl mb-6">
                Beneficios de la Digitalización
              </h2>
              <div className="space-y-4">
                {[
                  {
                    icon: <Clock className="w-6 h-6" />,
                    title: 'Ahorro de Tiempo',
                    description: 'Reduce el tiempo de registro hasta un 70% con formularios digitales optimizados.'
                  },
                  {
                    icon: <Activity className="w-6 h-6" />,
                    title: 'Datos en Tiempo Real',
                    description: 'Accede instantáneamente a estadísticas actualizadas para tomar mejores decisiones.'
                  },
                  {
                    icon: <Globe className="w-6 h-6" />,
                    title: 'Análisis Geográfico',
                    description: 'Conoce el origen de tus visitantes y adapta estrategias de marketing cultural.'
                  },
                  {
                    icon: <CheckCircle2 className="w-6 h-6" />,
                    title: 'Trazabilidad Completa',
                    description: 'Mantén un registro histórico completo con auditoría de todas las acciones.'
                  }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-blue-600">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg mb-1">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Números de VisiMap */}

      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl mb-4">
              VisiMap en Números
            </h2>
            <p className="text-xl text-blue-100">
              El impacto de la transformación digital
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '70%', label: 'Reducción en tiempo de registro' },
              { number: '100%', label: 'Datos digitalizados' },
              { number: '24/7', label: 'Acceso a información' },
              { number: '∞', label: 'Capacidad de análisis' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl mb-2">{stat.number}</div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección para contactar */}

      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl mb-6">
              Listo para Digitalizar tu Museo
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Únete a la transformación digital y lleva la gestión del Museo MUVI al siguiente nivel con VisiMap.
            </p>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-12 py-6"
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}

      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src={logoUrl}
                  alt="VisiMap Logo"
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = "w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg";
                    fallback.innerText = "V";
                    e.target.parentNode.prepend(fallback);
                  }}
                />
                <div>
                  <h3 className="text-lg">VisiMap</h3>
                  <p className="text-sm text-gray-400">Museo MUVI</p>
                </div>
              </div>
              <p className="text-gray-400">
                Sistema de gestión digital para museos del siglo XXI.
              </p>
            </div>

            <div>
              <h4 className="mb-4">Museo MUVI</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Villafranca de los Barros</li>
                <li>Extremadura, España</li>
                <li>
                  <a
                    href="https://www.museovillafranca.es/01_el_muvi.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    museovillafranca.es
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4">Tecnología</h4>
              <ul className="space-y-2 text-gray-400">
                <li>React + Tailwind CSS</li>
                <li>Supabase Backend</li>
                <li>Leaflet.js Maps</li>
                <li>Recharts Analytics</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 VisiMap - Museo MUVI. Sistema de Gestión de Visitantes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}