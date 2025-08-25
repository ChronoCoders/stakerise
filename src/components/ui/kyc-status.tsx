import React from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";
import {
  FileUp as FileUpload,
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  kycService,
  VerificationStatus,
  DocumentType,
} from "@/lib/kyc-service";
import { notificationService } from "@/lib/notification-service";
import { toast } from "sonner";

const STATUS_ICONS = {
  pending: Clock,
  in_review: UserCheck,
  approved: CheckCircle2,
  rejected: XCircle,
  expired: AlertTriangle,
};

const STATUS_COLORS = {
  pending: "text-yellow-500",
  in_review: "text-blue-500",
  approved: "text-green-500",
  rejected: "text-red-500",
  expired: "text-orange-500",
};

export function KYCStatus() {
  const [status, setStatus] = React.useState<VerificationStatus>("pending");
  const [documents, setDocuments] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);
  const [selectedDocType, setSelectedDocType] =
    React.useState<DocumentType>("passport");

  const StatusIcon = STATUS_ICONS[status];

  React.useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      const kycStatus = await kycService.getStatus();
      if (kycStatus) {
        setStatus(kycStatus.status);
      }
      const docs = await kycService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load KYC status:", error);
      toast.error("Failed to load verification status");
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await kycService.uploadDocument(selectedDocType, file, {
        document_type: selectedDocType,
        document_number: "",
        issuing_country: "",
        issue_date: new Date().toISOString(),
        expiry_date: new Date().toISOString(),
      });

      // Send email notification
      const settings = await notificationService.getSettings();
      if (settings?.document_updates) {
        await notificationService.sendEmail(
          "document_received",
          settings.email,
          "Document Uploaded Successfully",
          `Your ${selectedDocType.replace("_", " ")} has been uploaded and will be reviewed shortly.`,
        );
      }

      toast.success("Document uploaded successfully");
      loadKYCStatus();
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${STATUS_COLORS[status]}`} />
            <h2 className="text-lg font-semibold">KYC Verification</h2>
          </div>
          <span
            className={`text-sm font-medium ${STATUS_COLORS[status]} capitalize`}
          >
            {status.replace("_", " ")}
          </span>
        </div>

        {status !== "approved" && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">Required Documents</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Government-issued ID (Passport/Driver's License)</li>
                <li>• Proof of Address (Utility Bill/Bank Statement)</li>
                <li>• Clear photo of you holding your ID</li>
              </ul>
            </div>

            <div className="space-y-4">
              <Select
                value={selectedDocType}
                onValueChange={(value: DocumentType) =>
                  setSelectedDocType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">
                    Driver's License
                  </SelectItem>
                  <SelectItem value="national_id">National ID</SelectItem>
                  <SelectItem value="proof_of_address">
                    Proof of Address
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="flex-1"
                />
                <Button disabled={uploading}>
                  <FileUpload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>

            {documents.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Uploaded Documents</h3>
                <div className="space-y-2">
                  {documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-lg border bg-card/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium capitalize">
                          {doc.document_type.replace("_", " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded on{" "}
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-medium ${STATUS_COLORS[doc.verification_status]} capitalize`}
                      >
                        {doc.verification_status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {status === "approved" && (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Verification Complete</p>
            <p className="text-sm text-muted-foreground">
              Your account has been fully verified. You can now access all
              platform features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
