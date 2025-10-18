import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingPage() {
    const plans = [
        {
            name: "Free",
            price: "$0",
            description: "Perfect for trying out Kia",
            features: [
                "3 consultations per month",
                "Basic symptom analysis",
                "Healthcare provider recommendations",
                "Community support",
            ],
            cta: "Get Started",
            href: "/consult",
            popular: false,
        },
        {
            name: "Plus",
            price: "$19",
            description: "For regular health guidance",
            features: [
                "Unlimited consultations",
                "Advanced symptom analysis",
                "Image scanning (10 per month)",
                "Priority support",
                "Consultation history",
                "Export reports",
            ],
            cta: "Start Free Trial",
            href: "/account",
            popular: true,
        },
        {
            name: "Family",
            price: "$39",
            description: "Health guidance for the whole family",
            features: [
                "Everything in Plus",
                "Up to 5 family members",
                "Unlimited image scanning",
                "Family health dashboard",
                "Dedicated support",
                "Custom health insights",
            ],
            cta: "Start Free Trial",
            href: "/account",
            popular: false,
        },
    ]

    return (
        <main className="container px-4 py-16 max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="font-bold text-4xl md:text-5xl mb-4 text-balance">Simple, Transparent Pricing</h1>
                <p className="text-muted-foreground text-lg text-balance max-w-2xl mx-auto">
                    Choose the plan that fits your health needs. All plans include our core AI health guidance features.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 mb-16">
                {plans.map((plan) => (
                    <Card
                        key={plan.name}
                        className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                            <div className="mt-4">
                                <span className="font-bold text-4xl">{plan.price}</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex gap-3">
                                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                                <Link href={plan.href}>
                                    {plan.cta}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                    <div className="grid gap-8 md:grid-cols-2">
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Enterprise Solutions</h3>
                            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                                Need Kia for your healthcare organization, clinic, or large team? We offer custom enterprise solutions
                                with advanced features, dedicated support, and flexible deployment options.
                            </p>
                            <Button variant="outline" asChild className="bg-transparent">
                                <Link href="/contact">Contact Sales</Link>
                            </Button>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Frequently Asked Questions</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium mb-1">Can I cancel anytime?</p>
                                    <p className="text-muted-foreground">Yes, you can cancel your subscription at any time.</p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Is my data secure?</p>
                                    <p className="text-muted-foreground">
                                        Yes, we&#39;re HIPAA compliant and use enterprise-grade encryption.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
