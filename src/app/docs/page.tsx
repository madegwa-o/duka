import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, MessageSquare, ScanLine, Shield, Activity, FileText } from "lucide-react"

export default function DocsPage() {
    return (
        <main className="container px-4 py-16 max-w-4xl mx-auto">
            <div className="mb-12">
                <h1 className="font-bold text-4xl mb-4">Documentation</h1>
                <p className="text-muted-foreground text-lg">
                    Learn how to use Kia effectively for health guidance and medical insights.
                </p>
            </div>

            <Alert className="mb-8 border-primary/50 bg-primary/5">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription>
                    <strong>Medical Disclaimer:</strong> Kia is an AI assistant that provides health information and guidance. It
                    is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your
                    physician or other qualified health provider with any questions you may have regarding a medical condition.
                </AlertDescription>
            </Alert>

            <div className="space-y-8">
                <section>
                    <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
                        <Activity className="h-6 w-6 text-primary" />
                        Getting Started
                    </h2>
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">What is Kia?</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Kia is an AI-powered health assistant designed to help you understand your symptoms and guide you to
                                    appropriate medical care. Using advanced natural language processing and medical knowledge, Kia can
                                    analyze symptoms, suggest possible conditions, and recommend which healthcare professionals to
                                    consult.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">How to Use Kia</h3>
                                <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                                    <li>Describe your symptoms in detail</li>
                                    <li>Answer Kia&#39;s follow-up questions</li>
                                    <li>Review the analysis and recommendations</li>
                                    <li>Follow the guidance to seek appropriate care</li>
                                </ol>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-primary" />
                        Text Consultation
                    </h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>How It Works</CardTitle>
                            <CardDescription>Conversational symptom analysis and health guidance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Best Practices</h3>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Be specific about symptom location, duration, and severity</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Mention any relevant medical history or current medications</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Answer follow-up questions thoroughly</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Be honest about all symptoms, even if they seem unrelated</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">What Kia Provides</h3>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Symptom analysis and possible conditions</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Urgency assessment (emergency, urgent, routine)</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Healthcare provider recommendations</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>General guidance on next steps</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
                        <ScanLine className="h-6 w-6 text-primary" />
                        Image Scanning
                    </h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Medical Image Analysis</CardTitle>
                            <CardDescription>AI-powered visual assessment of medical conditions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Supported Image Types</h3>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Skin conditions (rashes, lesions, discoloration)</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Visible injuries (cuts, bruises, swelling)</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Physical abnormalities</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Other visible medical concerns</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Image Guidelines</h3>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Use good lighting and clear focus</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Include the affected area clearly in frame</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Maximum file size: 5MB</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Supported formats: JPG, PNG</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        Privacy & Security
                    </h2>
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Data Protection</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Kia is HIPAA compliant and uses enterprise-grade encryption to protect your health information. All
                                    conversations and images are encrypted in transit and at rest. We never share your personal health
                                    information with third parties without your explicit consent.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Data Retention</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Your consultation history is stored securely and can be accessed from your account. You can delete
                                    your data at any time from your account settings. Images are automatically deleted after 30 days
                                    unless you choose to save them.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        Important Information
                    </h2>
                    <Card className="border-destructive/50">
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2 text-destructive">When to Seek Emergency Care</h3>
                                <p className="text-muted-foreground text-sm mb-2">
                                    Call emergency services immediately if you experience:
                                </p>
                                <ul className="space-y-1 text-muted-foreground text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-destructive">•</span>
                                        <span>Chest pain or pressure</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-destructive">•</span>
                                        <span>Difficulty breathing</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-destructive">•</span>
                                        <span>Severe bleeding</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-destructive">•</span>
                                        <span>Loss of consciousness</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-destructive">•</span>
                                        <span>Severe allergic reactions</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-destructive">•</span>
                                        <span>Stroke symptoms (facial drooping, arm weakness, speech difficulty)</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Limitations</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Kia cannot provide definitive diagnoses, prescribe medications, or replace in-person medical
                                    examinations. Always consult with a qualified healthcare professional for proper diagnosis and
                                    treatment.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    )
}
