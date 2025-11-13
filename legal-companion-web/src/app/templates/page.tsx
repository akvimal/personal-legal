'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockTemplates, categoryLabels } from '@/lib/mock-data';
import { Template, DocumentCategory } from '@/types';
import {
  FileText,
  Filter,
  Search,
  Download,
  Eye,
  ChevronRight,
  Globe,
  Languages,
  CheckCircle,
  X,
} from 'lucide-react';

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Filter templates
  const filteredTemplates = mockTemplates.filter(template => {
    if (filterCategory !== 'all' && template.category !== filterCategory) return false;
    if (filterCountry !== 'all' && template.country !== filterCountry) return false;
    if (searchQuery && !template.title.toLowerCase().includes(searchQuery.toLowerCase())
        && !template.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getCategoryBadgeVariant = (category: DocumentCategory) => {
    switch (category) {
      case 'employment':
        return 'info' as const;
      case 'property':
        return 'success' as const;
      case 'business':
        return 'warning' as const;
      case 'financial':
        return 'critical' as const;
      default:
        return 'outline' as const;
    }
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 mt-14 lg:mt-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Legal Document Templates</h1>
              <p className="text-sm text-gray-600 mt-1">
                Generate legal documents with country-specific templates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info" className="text-sm">
                {filteredTemplates.length} Templates
              </Badge>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4 space-y-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Templates
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </h3>

                    {/* Category Filter */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            value="all"
                            checked={filterCategory === 'all'}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">All Categories</span>
                        </label>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="category"
                              value={key}
                              checked={filterCategory === key}
                              onChange={(e) => setFilterCategory(e.target.value)}
                              className="text-primary focus:ring-primary"
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Country Filter */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Country</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="country"
                            value="all"
                            checked={filterCountry === 'all'}
                            onChange={(e) => setFilterCountry(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">All Countries</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="country"
                            value="India"
                            checked={filterCountry === 'India'}
                            onChange={(e) => setFilterCountry(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">India</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Templates Grid */}
            <div className="lg:col-span-3">
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{template.title}</CardTitle>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant={getCategoryBadgeVariant(template.category)}>
                                {categoryLabels[template.category]}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Globe className="h-3 w-3" />
                                {template.country}, {template.region}
                              </div>
                            </div>
                          </div>
                          <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {template.description}
                        </p>

                        {/* Template Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Languages className="h-3 w-3" />
                            <span>Languages: {template.languages.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>{template.fields.length} fields to fill</span>
                          </div>
                        </div>

                        {/* Key Clauses */}
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">
                            Key Clauses Included:
                          </h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {template.clauses.slice(0, 3).map((clause, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-primary mt-0.5">•</span>
                                <span className="line-clamp-1">{clause}</span>
                              </li>
                            ))}
                            {template.clauses.length > 3 && (
                              <li className="text-gray-500">
                                +{template.clauses.length - 3} more...
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleUseTemplate(template)}
                          >
                            Use Template
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUseTemplate(template)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No templates found
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery || filterCategory !== 'all' || filterCountry !== 'all'
                        ? 'Try adjusting your filters or search query'
                        : 'No templates available'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Template Preview/Form Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedTemplate.title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedTemplate.country}, {selectedTemplate.region}
                </p>
              </div>
              <button
                onClick={handleClosePreview}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Template Description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-700">{selectedTemplate.description}</p>
              </div>

              {/* Template Form Fields */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Fill Template Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTemplate.fields.map((field) => (
                    <div
                      key={field.id}
                      className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-critical ml-1">*</span>}
                      </label>
                      {field.type === 'text' && (
                        <Input type="text" placeholder={field.label} />
                      )}
                      {field.type === 'number' && (
                        <Input type="number" placeholder={field.label} />
                      )}
                      {field.type === 'date' && (
                        <Input type="date" />
                      )}
                      {field.type === 'textarea' && (
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          rows={3}
                          placeholder={field.label}
                        />
                      )}
                      {field.type === 'select' && (
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                          <option value="">Select {field.label}</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                      {field.type === 'checkbox' && (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            className="text-primary focus:ring-primary rounded"
                          />
                          <span className="text-sm text-gray-700">{field.label}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Clauses */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Standard Clauses Included
                </h3>
                <ul className="space-y-2">
                  {selectedTemplate.clauses.map((clause, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{clause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-gray-200 pt-6">
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Document
                </Button>
                <Button variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" onClick={handleClosePreview}>
                  Cancel
                </Button>
              </div>

              {/* Info Notice */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> This is a standard template. It's recommended to have the
                  generated document reviewed by a legal professional before signing. Laws and
                  regulations may vary based on specific circumstances.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
