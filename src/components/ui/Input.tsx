type InputProps =
  React.InputHTMLAttributes<HTMLInputElement>;

export default function Input(
  props: InputProps
) {
  return (
    <input
      {...props}
      className={`w-full rounded border p-3 ${
        props.className || ""
      }`}
    />
  );
}