import fs from 'fs'
import path from 'path'
import { test, expect } from '@jest/globals'
import MigrationEditor from './MigrationEditor'
import TestHelper from '@Renderer/../../tests/base/TestHelper'

test('It can add content to schema create on up method', () => {
    const migrationContent = fs.readFileSync(path.join(__dirname, 'tests/input/creation-migration.php'), 'utf8')

    const migrationEditor = new MigrationEditor(migrationContent)

    expect(migrationEditor.getMigrationContent().includes(`$table->string('test_field')`)).toBe(false)

    migrationEditor.addContentToSchemaTableOnUpMethod('users', `$table->string('test_field')`)

    expect(migrationEditor.getMigrationContent().includes(`$table->string('test_field')`)).toBe(true)
})

test('It can add content to schema table on up method', () => {
    const migrationContent = fs.readFileSync(path.join(__dirname, 'tests/input/updater-migration.php'), 'utf8')

    const migrationEditor = new MigrationEditor(migrationContent)

    expect(migrationEditor.getMigrationContent().includes(`$table->string('test_field')`)).toBe(false)

    migrationEditor.addContentToSchemaCreateOnUpMethod('users', `$table->string('test_field')`)

    expect(migrationEditor.getMigrationContent().includes(`$table->string('test_field')`)).toBe(true)
})

test('It can replace schema create on up method', () => {
    const migrationContent = fs.readFileSync(path.join(__dirname, 'tests/input/creation-migration.php'), 'utf8')

    const migrationEditor = new MigrationEditor(migrationContent)

    expect(migrationEditor.getMigrationContent().includes(`$table->string('test_field')`)).toBe(false)

    migrationEditor.replaceSchemaCreateOnUpMethod('users', `$table->string('test_field')`)

    expect(migrationEditor.getMigrationContent().includes(`$table->string('test_field')`)).toBe(true)
})

test('It can replace schema table on up method', () => {
    const migrationContent = fs.readFileSync(path.join(__dirname, 'tests/input/updater-migration.php'), 'utf8')

    const migrationEditor = new MigrationEditor(migrationContent)

    expect(migrationEditor.getMigrationContent().includes(`$table->string('test_field')`)).toBe(false)

    migrationEditor.replaceSchemaTableOnUpMethod('users', `$table->string('test_field')`)

    expect(migrationEditor.getMigrationContent().includes(`$table->string('test_field')`)).toBe(true)
})

test('It can get schema create on up method', () => {
    const migrationContent = fs.readFileSync(path.join(__dirname, 'tests/input/creation-migration.php'), 'utf8'),
        migrationEditor = new MigrationEditor(migrationContent)

    const contentIsEqual = TestHelper.compareCode(migrationEditor.getSchemaCreateOnUpMethod('users'), `Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('avatar')->nullable();
        $table->string('email')->unique();
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password');
        $table->rememberToken();
        $table->timestamps();
    });`)

    expect(contentIsEqual).toBe(true)
})

test('It can get schema table on up method', () => {
    const migrationContent = fs.readFileSync(path.join(__dirname, 'tests/input/updater-migration.php'), 'utf8'),
        migrationEditor = new MigrationEditor(migrationContent)

    const contentIsEqual = TestHelper.compareCode(migrationEditor.getSchemaTableOnUpMethod('users'), `Schema::table('users', function (Blueprint $table) {
        $table->renameColumn('avatar', 'avatar_renamed');
    });`)

    expect(contentIsEqual).toBe(true)
})