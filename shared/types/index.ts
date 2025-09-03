export type ButtonProps = {
    label: string;
    onClick: () => void;
    disabled?: boolean;
};

export type InputProps = {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
};

export type Theme = {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
};

export type User = {
    id: string;
    name: string;
    email: string;
};