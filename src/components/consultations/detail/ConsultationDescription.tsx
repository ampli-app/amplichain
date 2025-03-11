
interface ConsultationDescriptionProps {
  description: string;
}

export const ConsultationDescription = ({ description }: ConsultationDescriptionProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Opis konsultacji</h2>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <p className="whitespace-pre-line">{description}</p>
      </div>
    </div>
  );
};
