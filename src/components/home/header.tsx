interface HeaderProps {
  label: string;
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col">
      <p className="text-md font-bold">{label}</p>
    </div>
  );
};
