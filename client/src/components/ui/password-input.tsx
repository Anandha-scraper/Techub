import { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = React.ComponentProps<typeof Input> & {
  toggleAriaLabel?: string;
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className, toggleAriaLabel, ...props },
  ref
) {
  const [show, setShow] = useState(false);
  const handlePressStart = () => setShow(true);
  const handlePressEnd = () => setShow(false);
  return (
    <div className="relative">
      <Input ref={ref} type={show ? 'text' : 'password'} className={className} {...props} />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center p-1 rounded border text-xs hover:bg-accent"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        aria-label={toggleAriaLabel || (show ? 'Hide password' : 'Show password')}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
});

export { PasswordInput };

