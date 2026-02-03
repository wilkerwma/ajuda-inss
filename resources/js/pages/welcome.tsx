import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import FormWrap from '@/components/form-wrap';
import HeroSection from '@/components/hero-section';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Ajuda INSS">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#eef3ff] via-[#dde7ff] to-[#f7f9ff] p-4 text-[#04152f] transition-colors duration-300 dark:bg-gradient-to-b dark:from-[#030712] dark:via-[#040a19] dark:to-[#02040b] dark:text-[#e6edff] sm:p-6">
                <header className="mb-6 w-full max-w-6xl text-sm">
                    <nav className="flex items-center justify-end gap-2">
                        <AppearanceToggleDropdown />
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-full border border-[#0d2c62]/30 bg-white/70 px-5 py-1.5 text-sm leading-normal text-[#04152f] shadow-sm backdrop-blur hover:border-[#0d2c62]/50 dark:border-[#3a4f7a] dark:bg-[#0f1f3c] dark:text-[#dfe7ff]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-full border border-transparent px-5 py-1.5 text-sm leading-normal text-[#04152f] hover:border-[#0d2c62]/30 hover:bg-white/60 dark:text-[#dfe7ff]"
                                >
                                    Entrar
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-full border border-[#0d2c62]/30 px-5 py-1.5 text-sm leading-normal text-[#04152f] hover:border-[#0d2c62]/50 dark:border-[#3a4f7a] dark:text-[#dfe7ff]"
                                    >
                                        Cadastrar
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                <main className="w-full max-w-6xl space-y-10 lg:space-y-14">
                    <HeroSection />

                    <section className="mx-auto w-full max-w-3xl px-4 text-center text-base leading-relaxed text-[#0a2a52] sm:px-6 sm:text-lg dark:text-[#dbe5ff]">
                        <div className="rounded-3xl border border-white/70 bg-white/70 px-6 py-6 shadow-[0_18px_55px_rgba(33,73,133,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-[#050816]/80 dark:shadow-[0_22px_70px_rgba(0,0,0,0.85)]">
                            <p>
                                Criado para quem busca o Benefício de
                                Prestação Continuada (BPC) ou o amparo da Lei
                                Orgânica da Assistência Social (LOAS), o Ajuda
                                INSS usa Inteligência Artificial para analisar
                                seu cenário, indicar se você pode estar apto a
                                receber o benefício e orientar os primeiros
                                passos necessários, reunindo em um único lugar
                                orientações práticas para agilizar seu pedido.
                            </p>
                        </div>
                    </section>

                    <FormWrap className="-mt-4 lg:-mt-10" />
                </main>
            </div>
        </>
    );
}
