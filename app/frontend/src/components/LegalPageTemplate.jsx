// src/components/LegalPageTemplate.jsx

function LegalPageTemplate({ title, content }) {
  return (
    <div className="legal-page">
      <div>
        <h1>{title}</h1>
        <div className="prose prose-lg max-w-none">{content}</div>
      </div>
    </div>
  );
}

export default LegalPageTemplate;