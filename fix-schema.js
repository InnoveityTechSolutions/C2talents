const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const replacements = {
  'description             String': 'description             String             @db.Text',
  'googleMapUrl            String?': 'googleMapUrl            String?            @db.Text',
  'website                 String?': 'website                 String?            @db.Text',
  'facebook                String?': 'facebook                String?            @db.Text',
  'instagram               String?': 'instagram               String?            @db.Text',
  'linkedin                String?': 'linkedin                String?            @db.Text',
  'youtube                 String?': 'youtube                 String?            @db.Text',
  'courseWiseFees          String?': 'courseWiseFees          String?            @db.Text',
  'scholarshipDetails      String?': 'scholarshipDetails      String?            @db.Text',
  'educationLoanDetails    String?': 'educationLoanDetails    String?            @db.Text',
  'internshipDetails       String?': 'internshipDetails       String?            @db.Text',
  'topRecruiters           String?': 'topRecruiters           String?            @db.Text',
  'admissionEligibility    String?': 'admissionEligibility    String?            @db.Text',
  'admissionProcess        String?': 'admissionProcess        String?            @db.Text',
  'documentsRequired       String?': 'documentsRequired       String?            @db.Text',
  'counsellingInfo         String?': 'counsellingInfo         String?            @db.Text',
  'admissionEntranceExams  String?': 'admissionEntranceExams  String?            @db.Text',
  'importantDates          String?': 'importantDates          String?            @db.Text',
  'logo                    String?': 'logo                    String?            @db.Text',
  'banner                  String?': 'banner                  String?            @db.Text',
  'collegeVideo            String?': 'collegeVideo            String?            @db.Text',
  'seoTitle                String?': 'seoTitle                String?            @db.Text',
  'seoDescription          String?': 'seoDescription          String?            @db.Text',
  'metaKeywords            String?': 'metaKeywords            String?            @db.Text',
  'url       String': 'url       String         @db.Text',
  'content   String': 'content   String   @db.Text',
  'image     String?': 'image     String?  @db.Text'
};

for (const [key, value] of Object.entries(replacements)) {
  schema = schema.replace(key, value);
}

schema = schema.replace(/facilities\s+String\?\s+\/\/\s*Comma-separated/g, 'facilities              String?            @db.Text // Comma-separated');
schema = schema.replace(/image\s+String\s+\/\/\s*Banner\/Main/g, 'image                   String             @db.Text // Banner/Main');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated');
