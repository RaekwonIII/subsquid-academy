module.exports = class Data1665047549147 {
  name = 'Data1665047549147'

  async up(db) {
    await db.query(`CREATE TABLE "asset" ("id" character varying NOT NULL, "supply" numeric, "min_balance" numeric, "is_sufficient" boolean, "status" character varying(11) NOT NULL, CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "asset_operation" ("id" character varying NOT NULL, "to" text, "from" text, "amount" numeric NOT NULL, "asset_id" character varying, CONSTRAINT "PK_66c28a44ec1de423e36d0926c0a" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_add68f04750d7e2a775389cbd5" ON "asset_operation" ("asset_id") `)
    await db.query(`ALTER TABLE "asset_operation" ADD CONSTRAINT "FK_add68f04750d7e2a775389cbd5f" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`DROP TABLE "asset"`)
    await db.query(`DROP TABLE "asset_operation"`)
    await db.query(`DROP INDEX "public"."IDX_add68f04750d7e2a775389cbd5"`)
    await db.query(`ALTER TABLE "asset_operation" DROP CONSTRAINT "FK_add68f04750d7e2a775389cbd5f"`)
  }
}
