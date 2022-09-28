#!/usr/bin/env python3

import argparse
from enum import Flag
import MySQLdb as db
import sys
import os

DB_PASS='somepassword'

def main(argv):
    """
        Export all tables out as CSV files.
        Create a base taxonomy file for use in further documentation.
    """
    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('-d', "--database", type=str, default='db_sosm', help='database to dump')
    parser.add_argument('-o', "--output-dir", type=str, default='export', help='directory to dump to')
    parser.add_argument('-u', "--user", type=str, default='root', help='User account to connect to server with')
    parser.add_argument('-p', "--password", type=str, default='', help='password to use, not showing default')
    parser.add_argument('-s', "--host", type=str, default='localhost', help='server address')
    parser.add_argument('-n', "--no-check", action='store_true', default=False, help='Skip DB validity check (useful for exporting any old DB)')


    args = parser.parse_args(argv)

    print("Database is '{}' and destination dir is '{}'".format(args.database, args.output_dir))
    if not os.path.exists(args.output_dir):
        os.makedirs(args.output_dir)
    os.chdir(args.output_dir)

    if args.password == '':
        args.password = DB_PASS

    # connect and verify DB is good
    connection = db.connect(user=args.user, password=args.password, database=args.database, host=args.host)

    if not args.no_check:
        try:
            connection.query('select * from systems limit 1')
            result = connection.use_result()
            row = result.fetch_row()
        except:
            print("Error querying for systems table, exiting.\nThe --no-check flag can skip this test")
            return 1

    connection.query('show tables')
    result = connection.use_result()
    tables = result.fetch_row(0)

    taxonomy = ''
    dictionary = []

    for table in tables:
        print(table[0])
        with open('{}.csv'.format(table[0]), 'wt') as file:
            connection.query('describe {}'.format(table[0]))
            result = connection.use_result()
            fields = result.fetch_row(0)
            fieldStr = ''
            tmpTax = 'Table: {}'.format(table[0])
            dictionary.append(table[0])
            for f in fields:
                fieldStr = '{},{}'.format(fieldStr, f[0])
                tmpTax = '{}\n{}({})'.format(tmpTax,f[0],f[1])
                dictionary.append(f[0])
            taxonomy = '{}\n\n\n{}'.format(taxonomy, tmpTax)
            fieldStr = fieldStr[1:]
            file.write(fieldStr)
            file.write('\n')
            connection.query('select {} from {}'.format(fieldStr, table[0]))
            result = connection.use_result()
            nRows = -1
            while True:
                rows = result.fetch_row(5)
                if not rows:
                    break
                for r in rows:
                    line = ''
                    for f, ft in zip(r, fields):
                        if ft[1].startswith('varchar') or ft[1].startswith('longtext'):
                            line = '{},"{}"'.format(line,f)
                        else:
                            line = '{},{}'.format(line,f)
                    line = line[1:]
                    file.write(line)
                    file.write('\n')
    with open('taxonomy.txt', 'wt') as txf:
        txf.write(taxonomy)
        txf.write('\n\nDictionary\n')
        dictionary = set(dictionary)
        dictionary = list(dictionary)
        dictionary.sort()
        for w in dictionary:
            txf.write('{}\n'.format(w))
    return 0

if __name__ == "__main__":
    retCode = main(sys.argv[1:])
    sys.exit(retCode)

    
