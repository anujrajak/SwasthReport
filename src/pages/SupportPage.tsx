import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/common/logo";
import { WhatsAppLinkButton } from "@/components/support/whatsapp-link-button";
import { MessageCircle, HelpCircle, Users } from "lucide-react";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/Lwq4BbQwyHFCAmypDNDz7k";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex flex-col items-center justify-center mb-4 space-y-3">
              <Logo size="lg" showText={false} />
              <h1 className="text-2xl font-semibold">Swasth Report</h1>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            <div className="space-y-4">
              <p className="text-muted-foreground text-center leading-relaxed">
                Need assistance with Swasth Report? Have questions about using
                the platform? Our support team is ready to help you. Join our
                WhatsApp support group to connect with other users and get
                answers to your queries.
              </p>
            </div>

            {/* Features */}
            <div className="grid gap-4 md:grid-cols-3 pt-4">
              <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg border bg-card">
                <HelpCircle className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Get Help</h3>
                <p className="text-sm text-muted-foreground">
                  Ask questions and get quick responses
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg border bg-card">
                <Users className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with other users and share experiences
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg border bg-card">
                <MessageCircle className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Quick Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get real-time support from our team
                </p>
              </div>
            </div>

            {/* WhatsApp Link Section */}
            <div className="flex flex-col items-center space-y-4 pt-6 border-t">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  Join Our WhatsApp Support Group
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Click the button below to join our WhatsApp group and post
                  your queries. Our support team and community members will be
                  happy to help you.
                </p>
              </div>
              <WhatsAppLinkButton
                url={WHATSAPP_GROUP_URL}
                text="Join WhatsApp Support Group"
              />
              <p className="text-xs text-muted-foreground text-center max-w-md">
                By joining, you agree to follow our community guidelines and
                maintain a respectful environment for all members.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

