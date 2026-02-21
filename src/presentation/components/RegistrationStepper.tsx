interface RegistrationStepperProps {
    currentStep: number;
}

export default function RegistrationStepper({ currentStep }: RegistrationStepperProps) {
    const steps = [
        { id: 1, label: 'DATOS PROFESIONALES' },
        { id: 2, label: 'EQUIPO MÉDICO' },
        { id: 3, label: 'ASEGURADORAS' },
        { id: 4, label: 'RESUMEN' },
    ];

    return (
        <div className="w-full bg-slate-50 py-10 border-b border-slate-200">
            <div className="max-w-4xl mx-auto px-6 md:px-12">
                <div className="flex items-center justify-between w-full">
                    {steps.map((step, index) => {
                        const isActive = step.id === currentStep;
                        return (
                            <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center justify-center relative">
                                    <div className={`size-12 rounded-full flex items-center justify-center text-lg font-bold bg-white border-2 transition-all z-10
                                        ${isActive ? 'border-brand-yellow text-brand-yellow ring-[6px] ring-brand-yellow/20' : 'border-slate-300 text-slate-500'}`}>
                                        {step.id}
                                    </div>
                                    <span className={`absolute top-16 text-[10px] sm:text-sm font-bold whitespace-nowrap transition-colors
                                        ${isActive ? 'text-brand-yellow' : 'text-slate-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                                {index !== steps.length - 1 && (
                                    <div className="flex-1 h-[2px] bg-slate-200 mx-2 sm:mx-6 min-w-[20px]"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
