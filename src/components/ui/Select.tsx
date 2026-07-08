type SelectProps =
  React.SelectHTMLAttributes<HTMLSelectElement>;

export default function Select(
  props: SelectProps
) {
  return (
    <select
      {...props}
      className={`w-full rounded border p-3 ${
        props.className || ""
      }`}
    />
  );
}