import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Scale, Building, CreditCard, Truck, Users, Home, Briefcase, Gavel, Download } from 'lucide-react';

interface LegalTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  complexity: 'Basic' | 'Standard' | 'Advanced';
  fields: string[];
  preview: string;
}

const EXPANDED_TEMPLATES: LegalTemplate[] = [
  {
    id: 'employment',
    name: 'Employment Dispute Settlement',
    category: 'Labor & Employment',
    description: 'Resolves workplace disputes including wrongful termination, discrimination, wage disputes',
    icon: <Briefcase className="h-5 w-5" />,
    complexity: 'Advanced',
    fields: ['Employee Name', 'Employer Name', 'Position', 'Employment Period', 'Dispute Nature', 'Compensation'],
    preview: 'Comprehensive employment settlement with severance, non-compete, and release terms...'
  },
  {
    id: 'landlord_tenant',
    name: 'Landlord-Tenant Agreement',
    category: 'Real Estate',
    description: 'Resolves rental disputes, security deposits, lease violations, and eviction matters',
    icon: <Home className="h-5 w-5" />,
    complexity: 'Standard',
    fields: ['Property Address', 'Landlord', 'Tenant', 'Lease Terms', 'Security Deposit', 'Violation Details'],
    preview: 'Structured resolution for rental disputes with clear obligations and timelines...'
  },
  {
    id: 'business_partnership',
    name: 'Business Partnership Dissolution',
    category: 'Business Law',
    description: 'Handles partnership splits, asset division, and ongoing business obligations',
    icon: <Building className="h-5 w-5" />,
    complexity: 'Advanced',
    fields: ['Partnership Name', 'Partners', 'Business Assets', 'Liabilities', 'Division Terms'],
    preview: 'Comprehensive partnership dissolution with asset valuation and distribution...'
  },
  {
    id: 'consumer_protection',
    name: 'Consumer Protection Settlement',
    category: 'Consumer Rights',
    description: 'Addresses consumer complaints, warranty issues, and merchant disputes',
    icon: <Users className="h-5 w-5" />,
    complexity: 'Basic',
    fields: ['Consumer', 'Business', 'Product/Service', 'Purchase Date', 'Issue Description', 'Resolution'],
    preview: 'Consumer-friendly resolution with refunds, replacements, or service corrections...'
  },
  {
    id: 'intellectual_property',
    name: 'IP Infringement Settlement',
    category: 'Intellectual Property',
    description: 'Resolves copyright, trademark, patent, and trade secret disputes',
    icon: <Scale className="h-5 w-5" />,
    complexity: 'Advanced',
    fields: ['IP Owner', 'Alleged Infringer', 'IP Type', 'Registration Details', 'Infringement Claims', 'Licensing Terms'],
    preview: 'Sophisticated IP settlement with licensing agreements and usage restrictions...'
  },
  {
    id: 'insurance_claim',
    name: 'Insurance Claim Settlement',
    category: 'Insurance',
    description: 'Resolves disputes between insurers and policyholders over claim denials or amounts',
    icon: <CreditCard className="h-5 w-5" />,
    complexity: 'Standard',
    fields: ['Policyholder', 'Insurance Company', 'Policy Number', 'Claim Amount', 'Dispute Reason', 'Settlement Amount'],
    preview: 'Insurance settlement with clear payment terms and coverage clarifications...'
  },
  {
    id: 'construction',
    name: 'Construction Dispute Resolution',
    category: 'Construction',
    description: 'Handles contractor disputes, defective work, delays, and payment issues',
    icon: <Truck className="h-5 w-5" />,
    complexity: 'Advanced',
    fields: ['Contractor', 'Property Owner', 'Project Description', 'Contract Amount', 'Dispute Details', 'Completion Terms'],
    preview: 'Construction settlement with work completion schedules and payment terms...'
  },
  {
    id: 'family_mediation',
    name: 'Family Mediation Agreement',
    category: 'Family Law',
    description: 'Addresses child custody, support, property division in family disputes',
    icon: <Users className="h-5 w-5" />,
    complexity: 'Advanced',
    fields: ['Parties', 'Children', 'Custody Terms', 'Support Amounts', 'Property Division', 'Visitation Schedule'],
    preview: 'Comprehensive family agreement with child welfare and support provisions...'
  }
];

const SPECIALIZED_CLAUSES = {
  'Non-Disclosure': 'Advanced confidentiality with specific carve-outs and time limitations',
  'Non-Compete': 'Geographic and temporal restrictions on competitive activities',
  'Indemnification': 'Comprehensive liability protection and defense obligations',
  'Force Majeure': 'Unforeseeable circumstances and performance excuses',
  'Liquidated Damages': 'Pre-determined monetary consequences for specific breaches',
  'Arbitration': 'Binding dispute resolution process and venue selection',
  'Jurisdiction': 'Court selection and legal venue determination',
  'Choice of Law': 'Governing legal framework and conflict resolution',
  'Termination Rights': 'Conditions and procedures for agreement termination',
  'Compliance Monitoring': 'Ongoing oversight and reporting requirements'
};

export const LegalTemplateManager: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);

  const categories = Array.from(new Set(EXPANDED_TEMPLATES.map(t => t.category)));
  const complexities = Array.from(new Set(EXPANDED_TEMPLATES.map(t => t.complexity)));

  const filteredTemplates = EXPANDED_TEMPLATES.filter(template => {
    return (selectedCategory === 'all' || template.category === selectedCategory) &&
           (selectedComplexity === 'all' || template.complexity === selectedComplexity);
  });

  const handleTemplateSelect = (template: LegalTemplate) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = (templateId: string) => {
    // This would integrate with the AI mediator to use the selected template
    console.log('Using template:', templateId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Legal Template Library</h2>
          <p className="text-muted-foreground">Advanced legal document templates for complex disputes</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {filteredTemplates.length} Templates Available
        </Badge>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="clauses" className="flex items-center gap-2">
            <Gavel className="h-4 w-4" />
            Legal Clauses
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Document Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Complexity Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Complexity Levels</SelectItem>
                {complexities.map(complexity => (
                  <SelectItem key={complexity} value={complexity}>{complexity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                      {template.icon}
                      <Badge variant={
                        template.complexity === 'Basic' ? 'default' :
                        template.complexity === 'Standard' ? 'secondary' : 'destructive'
                      }>
                        {template.complexity}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Key Fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.slice(0, 3).map(field => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                        {template.fields.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.fields.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(template.id);
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedTemplate && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedTemplate.icon}
                  {selectedTemplate.name} - Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Required Information:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTemplate.fields.map(field => (
                        <Badge key={field} variant="outline">{field}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Template Preview:</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {selectedTemplate.preview}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="clauses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(SPECIALIZED_CLAUSES).map(([clause, description]) => (
              <Card key={clause}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gavel className="h-4 w-4 text-primary" />
                    {clause}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{description}</p>
                  <Button variant="outline" size="sm">
                    Add to Document
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                AI-Powered Document Generator
              </CardTitle>
              <p className="text-muted-foreground">
                Generate custom legal documents based on your specific dispute details
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Document generator will be available during active mediation sessions</p>
                  <p className="text-sm">AI will automatically select and customize templates based on your dispute</p>
                </div>
                <Button className="w-full" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Document (Available in Session)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};