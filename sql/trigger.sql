-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION twoway_relation()
RETURNS TRIGGER AS $$
DECLARE 
    current_rel INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM relacao 
                    WHERE p1 = NEW.p2 AND p2 = NEW.p1) THEN
        IF(NEW.rel = 1) THEN
            current_rel = 3;
        ELSIF(NEW.rel = 2) THEN
            current_rel = 2;
        ELSIF(NEW.rel = 3) THEN
            current_rel = 3;
        ELSE
            current_rel = 0;
        END IF;

        INSERT INTO relacao (p1, p2, rel, metadata)
        VALUES (NEW.p2, NEW.p1, current_rel, NEW.metadata);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tgr_twoway_relation
AFTER INSERT ON relacao
FOR EACH ROW
EXECUTE FUNCTION twoway_relation();    