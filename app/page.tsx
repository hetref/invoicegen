import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Upload, 
  Sparkles, 
  FolderTree, 
  Mail, 
  Shield, 
  Zap, 
  Github,
  CheckCircle2,
  ArrowRight,
  FileText,
  Cloud,
  Lock,
  Cpu,
  Users,
  TrendingUp,
  Code,
  Download,
  Server,
  Database
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              Open Source • Self-Hostable • AI-Powered
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Invoice Management
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-4">
              Upload, create, organize, and share invoices with AI-powered data extraction. 
              Your complete open-source invoice management solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-base">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://github.com/hetref/invoicegen" target="_blank">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base">
                  <Github className="h-5 w-5" />
                  View on GitHub
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              No credit card required • 40MB free storage • Unlimited invoices
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your invoice management workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Smart Upload</CardTitle>
                <CardDescription>
                  Drag & drop invoices in PDF, PNG, JPG, or WebP format. Instant preview with secure cloud storage.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>AI Extraction</CardTitle>
                <CardDescription>
                  Automatically extract invoice data using Gemini AI. Get 1 free extraction or unlimited with your own API key.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Create Invoices</CardTitle>
                <CardDescription>
                  Build professional invoices with beautiful templates. Auto-generate PDFs ready for printing or sharing.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-orange-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <FolderTree className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Smart Organization</CardTitle>
                <CardDescription>
                  Organize with nested folders like Google Drive. Create unlimited groups and move invoices easily.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:border-pink-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle>Email Sharing</CardTitle>
                <CardDescription>
                  Send invoices directly via email with custom messages. Supports Gmail and custom SMTP servers.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="border-2 hover:border-indigo-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  OAuth authentication, encrypted storage, and complete data isolation. Your data stays yours.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Perfect For Everyone
            </h2>
            <p className="text-lg text-gray-600">
              Whether you're a freelancer, business owner, or accountant
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Freelancers</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Create professional invoices</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Organize by client</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Send directly to clients</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle className="text-lg">Small Business</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Manage vendor invoices</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Auto-extract data</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Organize by department</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Database className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">Accountants</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Upload client invoices</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Extract for bookkeeping</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Generate reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Cpu className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle className="text-lg">Consultants</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Create on the go</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Professional templates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Track all invoices</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              <Zap className="h-3 w-3 mr-1" />
              Built with Modern Technologies
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Tech Stack
            </h2>
            <p className="text-lg text-gray-600">
              Built with the latest and most reliable technologies
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {[
              { name: 'Next.js 15', icon: '⚛️' },
              { name: 'TypeScript', icon: '📘' },
              { name: 'PostgreSQL', icon: '🐘' },
              { name: 'Cloudflare R2', icon: '☁️' },
              { name: 'Gemini AI', icon: '🤖' },
              { name: 'Prisma ORM', icon: '🔷' },
            ].map((tech) => (
              <Card key={tech.name} className="text-center hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="text-3xl sm:text-4xl mb-2">{tech.icon}</div>
                  <CardTitle className="text-sm sm:text-base">{tech.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-600 mb-2" />
                <CardTitle>Fast & Modern</CardTitle>
                <CardDescription>
                  Built with latest stable technologies for optimal performance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Cloud className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Universal Deploy</CardTitle>
                <CardDescription>
                  Works on any cloud provider or self-hosted server
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Production-grade security practices built-in
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Self-Hosting */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">
              <Server className="h-3 w-3 mr-1" />
              Self-Hostable
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Host It Yourself
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete control over your data. Deploy to your own infrastructure or any cloud provider.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">1</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Clone Repository</h3>
                    <p className="text-gray-600">Get started with a simple git clone command</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">2</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Configure Environment</h3>
                    <p className="text-gray-600">Set up your database and storage credentials</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">3</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Deploy & Run</h3>
                    <p className="text-gray-600">Launch with Docker, Vercel, or traditional hosting</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="https://github.com/hetref/invoicegen#self-hosting-guide" target="_blank">
                  <Button variant="outline" className="w-full sm:w-auto gap-2">
                    <Code className="h-4 w-4" />
                    View Documentation
                  </Button>
                </Link>
                <Link href="https://github.com/hetref/invoicegen" target="_blank">
                  <Button className="w-full sm:w-auto gap-2">
                    <Download className="h-4 w-4" />
                    Get Source Code
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-xs sm:text-sm">bash</span>
                <Badge variant="secondary" className="text-xs">Quick Start</Badge>
              </div>
              <pre className="text-green-400 text-xs sm:text-sm overflow-x-auto">
                <code>{`# Clone repository
git clone https://github.com/hetref/invoicegen.git
cd invoicegen

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
npx prisma migrate deploy

# Start application
npm run dev`}</code>
              </pre>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Docker', icon: '🐳' },
              { name: 'Vercel', icon: '▲' },
              { name: 'Railway', icon: '🚂' },
              { name: 'DigitalOcean', icon: '🌊' },
            ].map((platform) => (
              <Card key={platform.name} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-2">{platform.icon}</div>
                  <p className="font-semibold">{platform.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source CTA */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Github className="h-16 w-16 mx-auto mb-6 text-gray-900" />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Open Source & Community Driven
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            InvoiceGen is open source and built by the community. Contribute, customize, and make it yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://github.com/hetref/invoicegen" target="_blank">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                <Github className="h-5 w-5" />
                Star on GitHub
              </Button>
            </Link>
            <Link href="https://github.com/hetref/invoicegen/blob/main/CONTRIBUTING.md" target="_blank">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Contribute
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>MIT Licensed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>No Vendor Lock-in</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Privacy First</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8">
            Join thousands of users managing their invoices smarter, not harder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2">
                Start Free Today
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="https://github.com/hetref/invoicegen" target="_blank">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-blue-600 gap-2">
                <Github className="h-5 w-5" />
                View Source Code
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h3 className="text-white font-semibold mb-4">InvoiceGen</h3>
              <p className="text-sm mb-4">
                Open source invoice management system. Self-hostable, AI-powered, and privacy-focused.
              </p>
              <div className="flex gap-4">
                <Link href="https://github.com/hetref/invoicegen" target="_blank" className="hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#use-cases" className="hover:text-white transition-colors">Use Cases</Link></li>
                <li><Link href="#technology" className="hover:text-white transition-colors">Technology</Link></li>
                <li><Link href="/sign-up" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="https://github.com/hetref/invoicegen#readme" target="_blank" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="https://github.com/hetref/invoicegen#self-hosting-guide" target="_blank" className="hover:text-white transition-colors">Self-Hosting</Link></li>
                <li><Link href="https://github.com/hetref/invoicegen/blob/main/CONTRIBUTING.md" target="_blank" className="hover:text-white transition-colors">Contributing</Link></li>
                <li><Link href="https://github.com/hetref/invoicegen/issues" target="_blank" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="https://github.com/hetref/invoicegen/blob/main/LICENSE" target="_blank" className="hover:text-white transition-colors">MIT License</Link></li>
                <li><Link href="https://github.com/hetref/invoicegen" target="_blank" className="hover:text-white transition-colors">Source Code</Link></li>
                <li><Link href="https://github.com/hetref/invoicegen/blob/main/CONTRIBUTING.md" target="_blank" className="hover:text-white transition-colors">Code of Conduct</Link></li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-gray-800" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2025 InvoiceGen. Made with ❤️ by the InvoiceGen Community</p>
            <p className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Code className="h-3 w-3 mr-1" />
                Open Source
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Privacy First
              </Badge>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
