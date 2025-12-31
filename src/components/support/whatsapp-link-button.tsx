import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppLinkButtonProps {
  url: string;
  text?: string;
  className?: string;
}

export function WhatsAppLinkButton({
  url,
  text = "Join WhatsApp Group",
  className,
}: WhatsAppLinkButtonProps) {
  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className={`bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
      style={{
        backgroundColor: "#25D366",
      }}
    >
      <FaWhatsapp className="mr-2 h-6 w-6" />
      {text}
    </Button>
  );
}

