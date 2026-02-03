import { motion } from 'framer-motion';

export default function HeroSection() {
    return (
        <section className="relative w-full overflow-hidden rounded-[40px] bg-gradient-to-br from-[#dbe6ff] via-[#c7d7ff] to-[#f1f4ff] px-6 py-24 text-center text-[#031634] shadow-[0_35px_120px_rgba(15,60,130,0.18)] dark:from-[#050b1c] dark:via-[#07102a] dark:to-[#0f1833] dark:text-[#f5f8ff]">
            <div
                className="absolute inset-0 opacity-60 dark:opacity-30"
                style={{
                    backgroundImage: 'url(/assets/img/hero-bg.webp)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-[#9fb8ff]/20 dark:from-[#060c1d]/90 dark:via-transparent dark:to-[#0a1635]/60" />

            <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
                <motion.div
                    className="flex-1 text-center lg:text-left"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    viewport={{ once: true }}
                >
                    <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-6 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-[#0c244b] shadow-lg shadow-[#7ca5ff]/40 dark:bg-white/10 dark:text-[#b7cdff]">
                        <span className="h-2 w-2 rounded-full bg-[#6c8dff]" />
                        Tecnologia Social
                    </span>
                    <h1 className="mb-5 text-4xl font-black tracking-tight text-[#040c24] drop-shadow-sm lg:text-6xl dark:text-white">
                        AJUDA INSS
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#1a2f5b] lg:text-xl dark:text-[#cfe0ff]">
                        Automação inteligente para guiar cidadãos no acesso aos
                        benefícios do INSS, BPC e LOAS com uma experiência
                        moderna, acolhedora e confiável.
                    </p>
                </motion.div>
                <motion.div
                    className="flex-1"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
                    viewport={{ once: true }}
                >
                    <div className="relative rounded-[32px] border border-white/50 bg-white/80 p-8 shadow-[0_25px_70px_rgba(30,64,141,0.18)] backdrop-blur dark:border-white/10 dark:bg-[#0e162d]/80">
                        <div className="absolute -top-6 left-10 h-12 w-12 rounded-full bg-gradient-to-br from-[#6d8eff] to-[#9ab5ff] shadow-lg" />
                        <div className="absolute -bottom-8 right-6 hidden h-14 w-14 rounded-full border border-white/60 dark:border-white/20 lg:block" />
                        <p className="text-left text-base leading-relaxed text-[#0d1d3b] dark:text-[#dfe7ff]">
                            “Descubra em minutos se você está apto a receber
                            benefícios assistenciais e receba orientação clara
                            sobre as próximas etapas.”
                        </p>
                        <div className="mt-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1f6aff] to-[#5a8dff]" />
                            <div>
                                <p className="text-sm font-semibold text-[#09152c] dark:text-white">
                                    Assistente Especializado
                                </p>
                                <p className="text-xs text-[#3b4a6c] dark:text-[#a8b5d9]">
                                    Consulta 24h com IA
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
