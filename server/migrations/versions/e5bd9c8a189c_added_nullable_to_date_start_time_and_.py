"""added nullable to date, start time and end time

Revision ID: e5bd9c8a189c
Revises: 6a0c42f10652
Create Date: 2023-08-17 15:14:12.165709

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e5bd9c8a189c'
down_revision = '6a0c42f10652'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('requests', schema=None) as batch_op:
        batch_op.alter_column('date',
               existing_type=sa.DATE(),
               nullable=False)
        batch_op.alter_column('start_time',
               existing_type=sa.TIME(),
               nullable=False)
        batch_op.alter_column('end_time',
               existing_type=sa.TIME(),
               nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('requests', schema=None) as batch_op:
        batch_op.alter_column('end_time',
               existing_type=sa.TIME(),
               nullable=True)
        batch_op.alter_column('start_time',
               existing_type=sa.TIME(),
               nullable=True)
        batch_op.alter_column('date',
               existing_type=sa.DATE(),
               nullable=True)

    # ### end Alembic commands ###
