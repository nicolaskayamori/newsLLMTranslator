from docling.document_converter import DocumentConverter

file_src = "/home/nicolas/Documents/Certificados/Formações_Técnicas-Certificado___Testes_têm_cheiro__Têm_sim,_e_nem_é_bom!_368.pdf"

converter = DocumentConverter()

doc = converter.convert(file_src).document

print(doc.export_to_markdown())