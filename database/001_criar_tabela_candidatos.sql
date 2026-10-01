USE [master];
GO

IF DB_ID(N'CadastroCurriculos') IS NULL
BEGIN
    CREATE DATABASE [CadastroCurriculos];
END;
GO

USE [CadastroCurriculos];
GO

IF OBJECT_ID(N'dbo.Candidatos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Candidatos
    (
        Id INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_Candidatos PRIMARY KEY,
        NomeCompleto NVARCHAR(200) NOT NULL,
        Email NVARCHAR(254) NOT NULL,
        Telefone NVARCHAR(30) NULL,
        AreaInteresse NVARCHAR(150) NULL,
        ResumoProfissional NVARCHAR(MAX) NULL,
        CriadoEm DATETIME2 NOT NULL
            CONSTRAINT DF_Candidatos_CriadoEm DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_Candidatos_NomeCompleto
            CHECK (LEN(LTRIM(RTRIM(NomeCompleto))) > 0),
        CONSTRAINT CK_Candidatos_Email
            CHECK (LEN(LTRIM(RTRIM(Email))) > 0)
    );
END;
GO
