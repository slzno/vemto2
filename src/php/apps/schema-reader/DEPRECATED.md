This app has been deprecated, as it was initially created as a prototype to enable continued development. 

The **schema-reader** app is not compatible with most Laravel projects' scenarios, as it uses migrations to determine the schema structure (but the main problem is that migrations can contain logic and raw queries, which would make detecting the correct schema nearly impossible).

This is why the **db-reader** app was created, which reads data directly by creating a database and executing migrations.